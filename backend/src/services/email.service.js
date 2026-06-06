const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { EmailLog } = require('../models');
const { logActivity } = require('../utils/logger');
const notificationService = require('./notification.service');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      family: 4, // force IPv4
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options) {
    const { 
      email, 
      subject, 
      template, 
      data, 
      recipientRole, 
      entityType, 
      entityId, 
      sentBy, 
      ipAddress,
      attachments = [] 
    } = options;

    // 1. Create Email Log (Pending)
    const emailLog = await EmailLog.create({
      recipientEmail: email,
      recipientRole,
      subject,
      templateName: template,
      status: 'PENDING',
      entityType,
      entityId,
      sentBy,
      ipAddress
    });

    try {
      // 2. Render Template
      const templatePath = path.join(__dirname, '../templates', template + '.ejs');
      const html = await ejs.renderFile(templatePath, { ...data, loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000' });

      // 3. Send Email
      const fromName = 'VyaparSetu ERP';
      const info = await this.transporter.sendMail({
        from: '"' + fromName + '" <' + process.env.SMTP_USER + '>',
        to: email,
        subject: subject,
        html: html,
        attachments: attachments
      });

      // 4. Update Log (Success)
      await emailLog.update({
        status: 'SENT',
        messageId: info.messageId,
        sentAt: new Date()
      });

      // 5. Log Activity
      const activityAction = 'EMAIL_SENT_' + template.toUpperCase();
      const activityDesc = 'Email sent to ' + email;
      await logActivity(sentBy || null, activityAction, entityType || 'SYSTEM', entityId || null, activityDesc, ipAddress);

      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // 6. Update Log (Failure)
      await emailLog.update({
        status: 'FAILED',
        errorMessage: error.message
      });

      console.warn('Email sending failed, but continuing execution to prevent blocking flows.');
      return null;
    }
  }

  async sendWelcomeVendor(user, vendor, sentBy, ip) {
    await this.sendEmail({
      email: user.email,
      subject: 'Welcome to VyaparSetu',
      template: 'welcome-vendor',
      data: { name: user.firstName, company: vendor.companyName, role: 'VENDOR' },
      recipientRole: 'VENDOR',
      sentBy,
      ipAddress: ip
    });
  }

  async sendWelcomeInternal(user, roleName, tempPassword, sentBy, ip) {
    await this.sendEmail({
      email: user.email,
      subject: 'VyaparSetu ERP Account Created',
      template: 'welcome-internal-user',
      data: { name: user.firstName, role: roleName, tempPassword },
      recipientRole: roleName,
      sentBy,
      ipAddress: ip
    });
  }

  async sendLoginAlert(user, req) {
    // Only for internal users
    if (user.role && user.role.name === 'VENDOR') return;

    await this.sendEmail({
      email: user.email,
      subject: 'Security Alert: New Login Detected',
      template: 'login-alert',
      data: { 
        email: user.email, 
        loginTime: new Date().toLocaleString(),
        ipAddress: req.ip,
        browser: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
      },
      recipientRole: user.role ? user.role.name : 'USER',
      sentBy: user.id,
      ipAddress: req.ip
    });
  }

  async sendResetPasswordEmail(user, token, ip) {
    const resetUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/reset-password?token=' + token;
    await this.sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      data: { resetUrl, expiryTime: '10 minutes' },
      recipientRole: user.role ? user.role.name : 'USER',
      sentBy: user.id,
      ipAddress: ip
    });
  }

  async sendRFQAssignedEmail(vendor, rfq, sentBy, ip) {
    await this.sendEmail({
      email: vendor.contactEmail,
      subject: 'New RFQ Assigned: ' + rfq.rfqNumber,
      template: 'rfq-assigned',
      data: { rfqNumber: rfq.rfqNumber, title: rfq.title, deadline: rfq.deadline.toLocaleDateString() },
      recipientRole: 'VENDOR',
      entityType: 'RFQ',
      entityId: rfq.id,
      sentBy,
      ipAddress: ip
    });
  }

  async sendApprovalRequest(approver, workflow, rfq, vendor, quotation, sentBy, ip) {
    const approvalUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/approvals/' + workflow.id;
    await this.sendEmail({
      email: approver.email,
      subject: 'Approval Required: ' + rfq.rfqNumber,
      template: 'approval-request',
      data: { 
        rfqNumber: rfq.rfqNumber, 
        vendorName: vendor.companyName, 
        totalAmount: quotation.totalAmount,
        recommendation: 'Lowest Bidder',
        approvalUrl: approvalUrl
      },
      recipientRole: 'MANAGER',
      entityType: 'ApprovalWorkflow',
      entityId: workflow.id,
      sentBy,
      ipAddress: ip
    });
  }

  async sendApprovalStatus(recipient, workflow, rfq, vendor, status, remarks, sentBy, ip) {
    const template = status === 'APPROVED' ? 'approval-approved' : 'approval-rejected';
    await this.sendEmail({
      email: recipient.email,
      subject: 'Quotation ' + status + ': ' + rfq.rfqNumber,
      template: template,
      data: { rfqNumber: rfq.rfqNumber, vendorName: vendor.companyName, remarks },
      recipientRole: 'PROCUREMENT_OFFICER',
      entityType: 'ApprovalWorkflow',
      entityId: workflow.id,
      sentBy,
      ipAddress: ip
    });
  }

  async sendPOEmail(vendor, po, pdfBuffer, sentBy, ip) {
    await this.sendEmail({
      email: vendor.contactEmail,
      subject: 'Purchase Order Issued: ' + po.poNumber,
      template: 'purchase-order',
      data: { poNumber: po.poNumber, vendorName: vendor.companyName, totalAmount: po.totalAmount },
      recipientRole: 'VENDOR',
      entityType: 'PurchaseOrder',
      entityId: po.id,
      sentBy,
      ipAddress: ip,
      attachments: pdfBuffer ? [{ filename: 'PO_' + po.poNumber + '.pdf', content: pdfBuffer }] : []
    });
  }

  async sendInvoiceEmail(vendor, invoice, pdfBuffer, sentBy, ip) {
    await this.sendEmail({
      email: vendor.contactEmail,
      subject: 'Invoice Generated: ' + invoice.invoiceNumber,
      template: 'invoice',
      data: { 
        invoiceNumber: invoice.invoiceNumber, 
        poNumber: 'N/A', 
        vendorName: vendor.companyName, 
        grandTotal: invoice.grandTotal,
        dueDate: invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'N/A'
      },
      recipientRole: 'VENDOR',
      entityType: 'Invoice',
      entityId: invoice.id,
      sentBy,
      ipAddress: ip,
      attachments: pdfBuffer ? [{ filename: 'Invoice_' + invoice.invoiceNumber + '.pdf', content: pdfBuffer }] : []
    });
  }
}

module.exports = new EmailService();
