const fs = require('fs');
const path = require('path');

const templates = {
  'approval-request.ejs': `<!DOCTYPE html>
<html>
<body>
    <div style="font-family: Arial; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #6f42c1;">Approval Required: <%= rfqNumber %></h2>
        <p>Hello Manager,</p>
        <p>A new quotation requires your approval to proceed to Purchase Order generation.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p><strong>RFQ:</strong> <%= rfqNumber %></p>
            <p><strong>Vendor:</strong> <%= vendorName %></p>
            <p><strong>Quotation Value:</strong> <%= totalAmount %></p>
            <p><strong>Recommendation:</strong> <%= recommendation %></p>
        </div>
        <p>Please review and take action.</p>
        <a href="<%= approvalUrl %>" style="background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">Review Approval</a>
    </div>
</body>
</html>`,

  'approval-approved.ejs': `<!DOCTYPE html>
<html>
<body>
    <div style="font-family: Arial; max-width: 600px; border: 1px solid #d4edda; padding: 20px;">
        <h2 style="color: #28a745;">Quotation Approved: <%= rfqNumber %></h2>
        <p>Hello Procurement Officer,</p>
        <p>Good news! The quotation for <strong><%= rfqNumber %></strong> by <strong><%= vendorName %></strong> has been fully approved.</p>
        <p>You can now proceed to generate the Purchase Order.</p>
        <a href="<%= loginUrl %>" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Proceed to PO</a>
    </div>
</body>
</html>`,

  'approval-rejected.ejs': `<!DOCTYPE html>
<html>
<body>
    <div style="font-family: Arial; max-width: 600px; border: 1px solid #f8d7da; padding: 20px;">
        <h2 style="color: #dc3545;">Quotation Rejected: <%= rfqNumber %></h2>
        <p>Hello Procurement Officer,</p>
        <p>The quotation for <strong><%= rfqNumber %></strong> by <strong><%= vendorName %></strong> was rejected during the approval workflow.</p>
        <p><strong>Remarks:</strong> <%= remarks %></p>
        <p>Please review the feedback and take necessary action.</p>
    </div>
</body>
</html>`,

  'purchase-order.ejs': `<!DOCTYPE html>
<html>
<body>
    <div style="font-family: Arial; max-width: 600px; border: 1px solid #007bff; padding: 20px;">
        <h2 style="color: #007bff;">Purchase Order Issued: <%= poNumber %></h2>
        <p>Hello <%= vendorName %>,</p>
        <p>We are pleased to issue the following Purchase Order based on your quotation.</p>
        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px;">
            <p><strong>PO Number:</strong> <%= poNumber %></p>
            <p><strong>Total Amount:</strong> <%= totalAmount %></p>
        </div>
        <p>The formal Purchase Order document is attached to this email.</p>
        <p>Please acknowledge receipt and proceed with fulfillment.</p>
    </div>
</body>
</html>`,

  'invoice.ejs': `<!DOCTYPE html>
<html>
<body>
    <div style="font-family: Arial; max-width: 600px; border: 1px solid #28a745; padding: 20px;">
        <h2 style="color: #28a745;">Invoice Generated: <%= invoiceNumber %></h2>
        <p>Hello <%= vendorName %>,</p>
        <p>Your invoice for PO <strong><%= poNumber %></strong> has been generated and processed in our system.</p>
        <div style="background: #e9f7ef; padding: 15px; border-radius: 8px;">
            <p><strong>Invoice Number:</strong> <%= invoiceNumber %></p>
            <p><strong>Grand Total:</strong> <%= grandTotal %></p>
            <p><strong>Due Date:</strong> <%= dueDate %></p>
        </div>
        <p>The digital invoice is attached for your records.</p>
    </div>
</body>
</html>`
};

Object.entries(templates).forEach(([filename, content]) => {
  fs.writeFileSync(path.join('backend/src/templates', filename), content);
  console.log('Created ' + filename);
});
