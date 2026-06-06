// TODO: READY FOR GMAIL INTEGRATION
// Once credentials are provided, use googleapis to monitor inbox
const { google } = require('googleapis');
const { ExternalMessage, Rfq } = require('../models');

class GmailService {
  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
  }

  async pollInbox() {
    // 1. Fetch unread messages
    // 2. Parse Subject and Body
    // 3. Match RFQ number using Regex
    // 4. Save to ExternalMessage
    // 5. Trigger Notification
    console.log('Gmail polling is READY FOR GMAIL INTEGRATION');
  }
}

module.exports = new GmailService();
