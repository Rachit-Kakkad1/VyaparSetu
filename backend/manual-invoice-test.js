const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testManualInvoice() {
  try {
    console.log('--- Manual Invoice Test ---');
    
    // 1. Login as Admin
    const loginRes = await axios.post(BASE_URL + '/auth/login', {
      email: 'admin@vyaparsetu.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;
    const adminHeaders = { headers: { Authorization: 'Bearer ' + token } };
    console.log('✅ Admin Login Successful');

    // 2. Fetch existing Vendor
    const vendorRes = await axios.get(BASE_URL + '/vendors', adminHeaders);
    const vendor = vendorRes.data.data.rows[0];
    if (!vendor) throw new Error('No vendors found. Please run integrate-test.js first.');
    console.log('✅ Using Vendor:', vendor.companyName);

    // 3. Create Manual Invoice
    const invoiceData = {
      invoiceNumber: 'MAN-INV-' + Date.now(),
      invoiceType: 'GST',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      vendorId: vendor.id,
      taxAmount: 180.00,
      discountAmount: 50.00,
      additionalCharges: 25.00,
      paymentTerms: 'Due in 7 days via NEFT',
      bankDetails: 'HDFC Bank, Acct: 12345678, IFSC: HDFC0001',
      authorizedSignatory: 'Manager - Operations',
      items: [
        { itemDescription: 'Industrial Server Rack', quantity: 2, unitPrice: 450.00 },
        { itemDescription: 'CAT6 Cable 100m', quantity: 1, unitPrice: 100.00 }
      ]
    };

    const createRes = await axios.post(BASE_URL + '/invoices', invoiceData, adminHeaders);
    const invoiceId = createRes.data.data.invoice.id;
    console.log('✅ Manual Invoice Created:', invoiceId);
    console.log('   Server Calculated Grand Total:', createRes.data.data.invoice.grandTotal);
    // Formula: (2*450 + 100) + 180 + 25 - 50 = 1000 + 155 = 1155. Let's see.

    // 4. Generate PDF
    console.log('Generating PDF (this launches Puppeteer)...');
    const pdfRes = await axios.post(BASE_URL + '/invoices/' + invoiceId + '/generate-pdf', {}, adminHeaders);
    console.log('✅ PDF Generated Success!');
    console.log('   PDF URL:', pdfRes.data.data.pdfUrl);

    // 5. Verify Details
    const detailRes = await axios.get(BASE_URL + '/invoices/' + invoiceId, adminHeaders);
    console.log('✅ Invoice Items Verified. Count:', detailRes.data.data.invoice.items.length);

    console.log('--- TEST COMPLETE: SUCCESS ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Failed:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testManualInvoice();
