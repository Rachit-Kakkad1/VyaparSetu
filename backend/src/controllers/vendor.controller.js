const vendorService = require('../services/vendor.service');
const ApiResponse = require('../utils/ApiResponse');

class VendorController {
  async createVendor(req, res, next) {
    try {
      const vendor = await vendorService.createVendor(req.body);
      ApiResponse.success(res, 'Vendor created successfully', { vendor }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllVendors(req, res, next) {
    try {
      const vendors = await vendorService.getAllVendors(req.query);
      ApiResponse.success(res, 'Vendors retrieved successfully', vendors);
    } catch (error) {
      next(error);
    }
  }

  async getVendorById(req, res, next) {
    try {
      const vendor = await vendorService.getVendorById(req.params.id);
      ApiResponse.success(res, 'Vendor retrieved successfully', { vendor });
    } catch (error) {
      next(error);
    }
  }

  async updateVendor(req, res, next) {
    try {
      const vendor = await vendorService.updateVendor(req.params.id, req.body);
      ApiResponse.success(res, 'Vendor updated successfully', { vendor });
    } catch (error) {
      next(error);
    }
  }

  async deleteVendor(req, res, next) {
    try {
      await vendorService.deleteVendor(req.params.id);
      ApiResponse.success(res, 'Vendor deleted successfully', null, 204);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VendorController();
