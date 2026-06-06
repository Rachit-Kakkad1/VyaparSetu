// Ready to be hooked into cron/node-schedule
const gmailService = require('../services/gmail.service');

const startEmailMonitor = () => {
  setInterval(() => {
    gmailService.pollInbox().catch(console.error);
  }, 60 * 1000); // Poll every minute
};

module.exports = startEmailMonitor;
