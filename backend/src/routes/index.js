const express = require('express');
const authRoutes = require('./auth.routes');
const vendorRoutes = require('./vendor.routes');
const rfqRoutes = require('./rfq.routes');
const quotationRoutes = require('./quotation.routes');
const poRoutes = require('./po.routes');
const invoiceRoutes = require('./invoice.routes');
const approvalRoutes = require('./approval.routes');
const notificationRoutes = require('./notification.routes');
const emailLogRoutes = require('./emailLog.routes');
const shipmentRoutes = require('./shipment.routes');
const userRoutes = require('./user.routes');
const activityLogRoutes = require('./activityLog.routes');
const chatRoutes = require('./chat.routes');

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ success: true, message: 'Server is up and running' }));

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);
router.use('/pos', poRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/approvals', approvalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/email-logs', emailLogRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/users', userRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
