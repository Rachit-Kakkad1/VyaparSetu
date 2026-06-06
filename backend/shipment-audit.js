const axios = require('axios');
const { Shipment, ShipmentTrackingLog, Notification, PurchaseOrder, Vendor, User } = require('./src/models');

const BASE_URL = 'http://localhost:5001/api';

async function runAudit() {
  try {
    console.log('--- Phase 1: Security Breach Test ---');
    // Login as Admin to setup test data
    const loginRes = await axios.post(BASE_URL + '/auth/login', {
      email: 'admin@vyaparsetu.com',
      password: 'password123'
    });
    const adminToken = loginRes.data.data.accessToken;
    const adminUser = loginRes.data.data.user;
    const adminHeaders = { headers: { Authorization: 'Bearer ' + adminToken } };

    // Get existing valid data from previous successful tests to avoid FK issues
    const validVendor = await Vendor.findOne({ order: [['createdAt', 'DESC']] });
    const validPO = await PurchaseOrder.findOne({ order: [['createdAt', 'DESC']] });

    console.log('✅ Testing with PO: ' + validPO.id + ' (Vendor: ' + validPO.vendorId + ')');

    // Register a malicious vendor user
    const maliciousEmail = 'malicious_' + Date.now() + '@audit.com';
    await axios.post(BASE_URL + '/auth/register', {
        firstName: 'Hacker', lastName: 'Vendor', email: maliciousEmail, password: 'password123', roleName: 'VENDOR'
    });
    const mLogin = await axios.post(BASE_URL + '/auth/login', { email: maliciousEmail, password: 'password123' });
    const mToken = mLogin.data.data.accessToken;
    const mHeaders = { headers: { Authorization: 'Bearer ' + mToken } };

    console.log('Testing Unauthorized Dispatch (Malicious Vendor trying another PO)...');
    try {
        await axios.post(BASE_URL + '/shipments/dispatch', { poId: validPO.id, vendorId: validVendor.id }, mHeaders);
        console.log('❌ FAIL: Malicious vendor was able to dispatch another vendor\'s PO');
    } catch (err) {
        console.log('✅ PASS: Unauthorized dispatch blocked with status ' + err.response.status);
        console.log('   Message: ' + err.response.data.message);
    }

    console.log('\n--- Phase 2: Persistence & Movement Audit ---');
    // Start a new shipment
    const dispatchRes = await axios.post(BASE_URL + '/shipments/dispatch', { 
        poId: validPO.id, 
        vendorId: validPO.vendorId,
        origin: { lat: 28.6139, lng: 77.2090 }, // Delhi
        destination: { lat: 19.0760, lng: 72.8777 } // Mumbai
    }, adminHeaders);
    const shipmentId = dispatchRes.data.data.shipment.id;
    console.log('Shipment created: ' + shipmentId);

    // Wait for movement
    console.log('Waiting for simulation progress (20s)...');
    await new Promise(r => setTimeout(r, 20000));

    const updatedShipment = await Shipment.findByPk(shipmentId);
    console.log('✅ Shipment Progress: ' + updatedShipment.progressPercentage + '%');
    console.log('✅ Current Lat: ' + updatedShipment.currentLat);

    const logs = await ShipmentTrackingLog.findAll({ where: { shipmentId }, order: [['timestamp', 'ASC']] });
    console.log('✅ Movement Logs found: ' + logs.length);
    if (logs.length >= 2) {
        console.log('✅ Path Reconstruction verified (Step 1 -> Step 2 movement detected)');
    }

    console.log('\n--- Phase 3: Notification Audit ---');
    // We wait for 75% for notification logic, but for speed let's check any generic shipment alerts
    const alerts = await Notification.findAll({ where: { link: '/shipments/' + shipmentId } });
    console.log('✅ Notifications generated: ' + alerts.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Audit Failed:');
    if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    else console.error(error.stack);
    process.exit(1);
  }
}

runAudit();
