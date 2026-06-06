const jwt = require('jsonwebtoken');
const { User, Role, Vendor, VendorUser, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./email.service');
const { logActivity } = require('../utils/logger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
};

class AuthService {
  async register(data, req) {
    const { firstName, lastName, email, password, roleName, companyName } = data;
    const t = await sequelize.transaction();
    
    try {
      let role = await Role.findOne({ where: { name: roleName || 'VENDOR' } });
      if (!role) {
        role = await Role.create({ name: roleName || 'VENDOR' }, { transaction: t });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        roleId: role.id
      }, { transaction: t });

      let vendor = null;
      if (role.name === 'VENDOR') {
        vendor = await Vendor.create({
          companyName: companyName || firstName + "'s Company",
          contactEmail: email,
          status: 'PENDING'
        }, { transaction: t });

        await VendorUser.create({
          vendorId: vendor.id,
          userId: user.id
        }, { transaction: t });
      }

      await t.commit();

      // Trigger Welcome Email
      if (role.name === 'VENDOR' && vendor) {
        await emailService.sendWelcomeVendor(user, vendor, null, req.ip);
      } else {
        await emailService.sendWelcomeInternal(user, role.name, 'N/A', null, req.ip);
      }

      return user;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async login(email, password, req) {
    const user = await User.scope('withPassword').findOne({ 
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account is deactivated', 403);
    }

    const accessToken = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    let vendor = null;
    if (user.role && user.role.name === 'VENDOR') {
      const vu = await VendorUser.findOne({
        where: { userId: user.id },
        include: [{ model: Vendor, as: 'vendor' }]
      });
      if (vu) {
        vendor = vu.vendor;
      }
    }

    const userJson = user.toJSON();
    userJson.vendor = vendor;

    // Trigger Login Alert
    emailService.sendLoginAlert(user, req).catch(err => console.error('Login alert failed', err));
    await logActivity(user.id, 'LOGIN', 'User', user.id, 'User logged in', req.ip);
    
    return { user: userJson, accessToken, refreshToken };
  }

  async forgotPassword(email, req) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('No user found with that email address', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validate: false });

    try {
      await emailService.sendResetPasswordEmail(user, resetToken, req.ip);
      await logActivity(user.id, 'FORGOT_PASSWORD_REQUEST', 'User', user.id, 'Password reset email requested', req.ip);
    } catch (error) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save({ validate: false });
      throw new AppError('There was an error sending the email. Try again later.', 500);
    }

    return true;
  }

  async resetPassword(token, newPassword, req) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetToken: resetTokenHash
      }
    });

    if (!user || user.resetTokenExpiry < Date.now()) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    await logActivity(user.id, 'PASSWORD_RESET_SUCCESS', 'User', user.id, 'Password updated via reset link', req.ip);

    return true;
  }
}

module.exports = new AuthService();
