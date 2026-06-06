const sendEmail = require('../utils/email');

class EmailService {
  async sendVerificationEmail(email, token) {
    const html = `<h1>Verify your email</h1><p>Your token is ${token}</p>`;
    await sendEmail({ email, subject: 'Verify Email', html });
  }

  async sendResetPasswordEmail(email, token) {
    const html = `<h1>Reset Password</h1><p>Use this token to reset your password: ${token}</p>`;
    await sendEmail({ email, subject: 'Password Reset', html });
  }

  async sendRFQAssignedEmail(email, rfq) {
    const html = `<h1>New RFQ Assigned</h1><p>You have been assigned to RFQ ${rfq.rfqNumber}</p>`;
    await sendEmail({ email, subject: 'RFQ Assigned', html });
  }

  async sendApprovalRequestEmail(email, workflow) {
    const html = `<h1>Approval Requested</h1><p>A new approval is pending for workflow ${workflow.id}</p>`;
    await sendEmail({ email, subject: 'Approval Requested', html });
  }

  async sendApprovalApprovedEmail(email, workflow) {
    const html = `<h1>Approval Approved</h1><p>Your workflow ${workflow.id} was approved.</p>`;
    await sendEmail({ email, subject: 'Approval Granted', html });
  }

  async sendApprovalRejectedEmail(email, workflow) {
    const html = `<h1>Approval Rejected</h1><p>Your workflow ${workflow.id} was rejected.</p>`;
    await sendEmail({ email, subject: 'Approval Rejected', html });
  }

  async sendPOEmail(email, po) {
    const html = `<h1>Purchase Order Generated</h1><p>PO ${po.poNumber} has been issued.</p>`;
    await sendEmail({ email, subject: 'Purchase Order Issued', html });
  }

  async sendInvoiceEmail(email, invoice) {
    const html = `<h1>Invoice Generated</h1><p>Invoice ${invoice.invoiceNumber} has been generated.</p>`;
    await sendEmail({ email, subject: 'Invoice Generated', html });
  }
}

module.exports = new EmailService();
