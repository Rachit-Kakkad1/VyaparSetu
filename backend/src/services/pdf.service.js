const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

class PdfService {
  async generateAndUploadPDF(htmlContent, filename) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'vyaparsetu_pdfs', public_id: filename },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(pdfBuffer);
    });
  }

  async generatePO(po) {
    const html = `<h1>Purchase Order: ${po.poNumber}</h1><p>Amount: ${po.totalAmount}</p>`;
    return await this.generateAndUploadPDF(html, `po_${po.poNumber}`);
  }

  async generateInvoice(invoice) {
    const html = `<h1>Invoice: ${invoice.invoiceNumber}</h1><p>Amount: ${invoice.grandTotal}</p>`;
    return await this.generateAndUploadPDF(html, `invoice_${invoice.invoiceNumber}`);
  }
}

module.exports = new PdfService();
