const fs = require('fs');
const path = require('path');

const templates = {
  'welcome-internal-user.ejs': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background: #343a40; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 25px; background: #343a40; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .info-box { background: #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VyaparSetu ERP Internal</h1>
        </div>
        <div class="content">
            <h2>Welcome, <%= name %>!</h2>
            <p>Your internal account has been created successfully.</p>
            <div class="info-box">
                <p><strong>Assigned Role:</strong> <%= role %></p>
                <p><strong>Temporary Password:</strong> <code><%= tempPassword %></code></p>
            </div>
            <p>Please login and change your password immediately for security reasons.</p>
            <a href="<%= loginUrl %>" class="button">Access Admin Portal</a>
        </div>
        <div class="footer">
            &copy; 2026 VyaparSetu Enterprise.
        </div>
    </div>
</body>
</html>`,

  'login-alert.ejs': `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; color: #333; }
        .container { border: 2px solid #dc3545; border-radius: 8px; max-width: 500px; margin: auto; overflow: hidden; }
        .header { background: #dc3545; color: white; padding: 15px; text-align: center; }
        .content { padding: 20px; }
        .details { background: #f8d7da; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h2>Security Alert: New Login</h2></div>
        <div class="content">
            <p>A new login was detected for your account <strong><%= email %></strong>.</p>
            <div class="details">
                Time: <%= loginTime %><br>
                IP: <%= ipAddress %><br>
                Browser: <%= browser %><br>
                Platform: <%= platform %>
            </div>
            <p style="color: #721c24;">If this wasn't you, please reset your password immediately and contact IT support.</p>
        </div>
    </div>
</body>
</html>`,

  'reset-password.ejs': `<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: auto; border: 1px solid #ccc; border-radius: 8px; font-family: Arial; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; text-align: center; }
        .btn { background: #28a745; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Password Reset Request</h1></div>
        <div class="content">
            <p>You requested a password reset for your VyaparSetu account.</p>
            <p>Click the button below to set a new password. This link expires in <%= expiryTime %>.</p>
            <a href="<%= resetUrl %>" class="btn">Reset My Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>`,

  'rfq-assigned.ejs': `<!DOCTYPE html>
<html>
<body>
    <div style="font-family: Arial; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #0056b3;">New RFQ Opportunity: <%= rfqNumber %></h2>
        <p>Hello Vendor,</p>
        <p>You have been assigned to a new Request for Quotation (RFQ).</p>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Title:</strong></td><td><%= title %></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Deadline:</strong></td><td><%= deadline %></td></tr>
        </table>
        <p>Please submit your competitive quotation before the deadline to be considered.</p>
        <a href="<%= loginUrl %>" style="background: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Submit Quotation</a>
    </div>
</body>
</html>`
};

Object.entries(templates).forEach(([filename, content]) => {
  fs.writeFileSync(path.join('backend/src/templates', filename), content);
  console.log('Created ' + filename);
});
