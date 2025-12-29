/**
 * Email Service for FloFaction
 * Handles sending transactional and marketing emails
 * PHASE 1-C: Email Backend Integration
 */

const nodemailer = require('nodemailer');

// Email configuration from environment variables
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER || 'flofaction.business@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Flo Faction <noreply@flofaction.com>';

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

/**
 * Send intake form confirmation email
 * POST /api/send-email/intake-confirmation
 */
async function sendIntakeConfirmation(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientName, clientEmail, intakeType } = req.body;

    if (!clientEmail || !clientName) {
      return res.status(400).json({ error: 'Client name and email are required' });
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: clientEmail,
      subject: 'Intake Form Received - Flo Faction Insurance',
      html: `
        <h2>Thank You for Your Submission</h2>
        <p>Hello ${clientName},</p>
        <p>We have received your intake form for ${intakeType} services.</p>
        <p>Our team will review your information and contact you within 24 hours.</p>
        <p>Best regards,<br>Flo Faction Insurance Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}

/**
 * Send insurance quote request confirmation
 * POST /api/send-email/quote-confirmation
 */
async function sendQuoteConfirmation(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientName, clientEmail, quoteType } = req.body;

    if (!clientEmail || !clientName) {
      return res.status(400).json({ error: 'Client name and email are required' });
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: clientEmail,
      subject: 'Quote Request Received - Flo Faction',
      html: `
        <h2>Quote Request Confirmation</h2>
        <p>Hello ${clientName},</p>
        <p>Thank you for requesting a quote for ${quoteType} insurance.</p>
        <p>Our insurance specialist will prepare a customized quote and send it to you shortly.</p>
        <p>We look forward to serving you.<br>Flo Faction Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
}

/**
 * Send admin notification for new intakes
 * Used internally to notify admin of new form submissions
 */
async function sendAdminNotification(clientData) {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_USER,
      subject: `New Intake Submission - ${clientData.clientName}`,
      html: `
        <h3>New Intake Form Received</h3>
        <p><strong>Client Name:</strong> ${clientData.clientName}</p>
        <p><strong>Client Email:</strong> ${clientData.clientEmail}</p>
        <p><strong>Phone:</strong> ${clientData.clientPhone || 'N/A'}</p>
        <p><strong>Service Type:</strong> ${clientData.intakeType || 'N/A'}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent');
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

module.exports = {
  sendIntakeConfirmation,
  sendQuoteConfirmation,
  sendAdminNotification
};
