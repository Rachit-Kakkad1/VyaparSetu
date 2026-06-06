const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      ApiResponse.success(res, 'User registered successfully', { user }, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      
      res.cookie('jwt', data.accessToken, {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1h
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });

      ApiResponse.success(res, 'Login successful', data);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const data = await authService.refreshToken(refreshToken);
      ApiResponse.success(res, 'Token refreshed successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      if (req.user) {
        await authService.logout(req.user.id);
      }
      res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
      ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      ApiResponse.success(res, 'User retrieved successfully', { user: req.user });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      ApiResponse.success(res, 'Token sent to email');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      ApiResponse.success(res, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
