const shipmentService = require('../services/shipment.service');
const ApiResponse = require('../utils/ApiResponse');

class ShipmentController {
  async dispatchShipment(req, res, next) {
    try {
      const { poId, vendorId, origin, destination } = req.body;
      // Default locations if not provided for demo
      const defOrigin = origin || { lat: 28.6139, lng: 77.2090 }; // Delhi
      const defDest = destination || { lat: 19.0760, lng: 72.8777 }; // Mumbai
      
      const shipment = await shipmentService.dispatchShipment(poId, vendorId, defOrigin, defDest);
      ApiResponse.success(res, 'Shipment dispatched and simulation started', { shipment }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getShipmentById(req, res, next) {
    try {
      const shipment = await shipmentService.getShipmentById(req.params.id);
      ApiResponse.success(res, 'Shipment tracking details retrieved', { shipment });
    } catch (error) {
      next(error);
    }
  }

  async getAllShipments(req, res, next) {
    try {
      const shipments = await shipmentService.getAllShipments(req.query, req.user);
      ApiResponse.success(res, 'Shipments retrieved successfully', { shipments });
    } catch (error) {
      next(error);
    }
  }

  async getRoute(req, res, next) {
    try {
      const route = await shipmentService.getRoute(req.params.id);
      ApiResponse.success(res, 'Shipment route retrieved', { route });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShipmentController();
