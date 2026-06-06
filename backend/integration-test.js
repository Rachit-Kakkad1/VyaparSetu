const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  try {
    console.log('--- Phase 1: Auth ---');
    const loginRes = await axios.post(BASE_URL + '/auth/login', {
      email: 'admin@vyaparsetu.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;
    const userId = loginRes.data.data.user.id;
    console.log('✅ Login Successful');

    const authHeaders = { headers: { Authorization: 'Bearer ' + token } };

    console.log('\n--- Phase 2: Vendor ---');
    const vendorRes = await axios.post(BASE_URL + '/vendors', {
      companyName: 'Test Vendor Corp',
      contactEmail: 'vendor@test.com'
    }, authHeaders);
    const vendorId = vendorRes.data.data.vendor.id;
    console.log('✅ Vendor Created: ' + vendorId);

    console.log('\n--- Phase 3: RFQ ---');
    const rfqRes = await axios.post(BASE_URL + '/rfqs', {
      title: 'Procurement of Server Hardware',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      items: [
        { itemName: 'Dell PowerEdge R740', quantity: 5, uom: 'UNIT' }
      ],
      vendorIds: [vendorId]
    }, authHeaders);
    const rfqId = rfqRes.data.data.rfq.id;
    const rfqItemId = rfqRes.data.data.rfq.items[0].id;
    console.log('✅ RFQ Created: ' + rfqId);

    console.log('\n--- Phase 4: Quotation ---');
    const vendorUserEmail = 'vendor_' + Date.now() + '@test.com';
    await axios.post(BASE_URL + '/auth/register', {
      firstName: 'Vendor',
      lastName: 'User',
      email: vendorUserEmail,
      password: 'password123',
      roleName: 'VENDOR'
    });
    
    const vendorLoginRes = await axios.post(BASE_URL + '/auth/login', {
      email: vendorUserEmail,
      password: 'password123'
    });
    const vendorToken = vendorLoginRes.data.data.accessToken;
    const vendorAuthHeaders = { headers: { Authorization: 'Bearer ' + vendorToken } };

    const quoteRes = await axios.post(BASE_URL + '/quotations', {
      rfqId: rfqId,
      vendorId: vendorId,
      items: [
        { rfqItemId: rfqItemId, unitPrice: 5000, quantity: 5 }
      ]
    }, vendorAuthHeaders);
    const quoteId = quoteRes.data.data.quotation.id;
    console.log('✅ Quotation Submitted: ' + quoteId);

    console.log('\n--- Phase 5: Approval ---');
    const approvalInitRes = await axios.post(BASE_URL + '/approvals', {
       rfqId: rfqId,
       quotationId: quoteId,
       approvers: [
         { approverId: userId, stepOrder: 1 }
       ]
    }, authHeaders);
    const workflowId = approvalInitRes.data.data.workflow.id;
    const stepId = approvalInitRes.data.data.workflow.steps[0].id;
    console.log('✅ Approval Workflow Initiated: ' + workflowId);

    await axios.put(BASE_URL + '/approvals/' + stepId + '/approve', {
      remarks: 'Looks good, pricing is optimal.'
    }, authHeaders);
    console.log('✅ Quotation Approved (Workflow Step 1)');

    console.log('\n--- Phase 6: Purchase Order ---');
    const poRes = await axios.post(BASE_URL + '/pos', {
      quotationId: quoteId
    }, authHeaders);
    const poId = poRes.data.data.po.id;
    console.log('✅ PO Generated: ' + poId);

    console.log('\n--- Phase 7: Invoice ---');
    const invoiceRes = await axios.post(BASE_URL + '/invoices', {
      poId: poId,
      taxRate: 0.18
    }, authHeaders);
    console.log('✅ Invoice Generated: ' + invoiceRes.data.data.invoice.id);
    console.log('\n--- TEST COMPLETE: SUCCESS ---');

  } catch (error) {
    console.error('❌ Test Failed:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runTest();
