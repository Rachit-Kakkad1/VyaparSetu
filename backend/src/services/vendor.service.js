const { Vendor, VendorCategory, VendorUser, User } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class VendorService {
  async createVendor(data) {
    return await Vendor.create(data);
  }

  async getAllVendors(query) {
    const { page = 1, limit = 10, search, categoryId, status } = query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.companyName = { [Op.iLike]: `%${search}%` };
    }
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    return await Vendor.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ model: VendorCategory, as: 'category' }]
    });
  }

  async getVendorById(id) {
    const vendor = await Vendor.findByPk(id, {
      include: [
        { model: VendorCategory, as: 'category' },
        { model: VendorUser, as: 'users', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }] }
      ]
    });
    if (!vendor) throw new AppError('Vendor not found', 404);
    return vendor;
  }

  async updateVendor(id, data) {
    const vendor = await this.getVendorById(id);
    return await vendor.update(data);
  }

  async deleteVendor(id) {
    const vendor = await this.getVendorById(id);
    await vendor.destroy();
    return true;
  }
}

module.exports = new VendorService();
