const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./email.service');

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
  async register(data) {
    const { firstName, lastName, email, password, roleName } = data;
    
    let role = await Role.findOne({ where: { name: roleName || 'VENDOR' } });
    if (!role) {
      role = await Role.create({ name: roleName || 'VENDOR' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      roleId: role.id
    });

    return user;
  }

  async login(email, password) {
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

    user.password = undefined; // Remove from output
    
    return { user, accessToken, refreshToken };
  }

  async refreshToken(token) {
    if (!token) throw new AppError('Refresh token is required', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = signToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    const user = await User.findByPk(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('No user found with that email address', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validate: false });

    try {
      await emailService.sendResetPasswordEmail(user.email, resetToken);
    } catch (error) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save({ validate: false });
      throw new AppError('There was an error sending the email. Try again later.', 500);
    }

    return true;
  }

  async resetPassword(token, newPassword) {
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

    return true;
  }
}

module.exports = new AuthService();
