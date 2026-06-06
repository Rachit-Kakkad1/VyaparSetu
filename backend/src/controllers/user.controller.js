const { User, Role } = require('../models');
const ApiResponse = require('../utils/ApiResponse');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll({
        include: [{ model: Role, as: 'role', attributes: ['name'] }]
      });
      ApiResponse.success(res, 'Users retrieved successfully', { users });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return ApiResponse.error(res, 'User not found', 404);
      
      user.isActive = !user.isActive;
      await user.save();
      
      ApiResponse.success(res, 'User status updated', { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
