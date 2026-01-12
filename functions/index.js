const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const nodemailer = require('nodemailer');

admin.initializeApp();

// ============================================
// IMPORT MODULES
// ============================================

// Phone Arbitrage System
const phoneArbitrage = require('./agents/PhoneArbitrageSystem');

// Payment Handlers
const paymentHandlers = require('./paymentHandlers');

// ManyChat Integration
const manychat = require('./manychat-integration');

// Agent Framework
const agentHandler = require('./agent-handler');

// Lead Management
const leadManagement = require('./leadManagement');

// ============================================
// EMAIL ROUTING CONFIGURATION
// ============================================
const emailRouting = {
  property: {
    keywords: ['auto', 'car', 'vehicle', 'homeowners', 'home', 'renters', 'landlord', 'property', 'fire', 'theft'],
    primaryEmail: process.env.SMTP_USER_HRI || 'paul@hriinsurance.com',
    ccEmail: process.env.SMTP_USER_INSURANCE || 'flofaction.insurance@gmail.com',
    category: 'PROPERTY_INSURANCE'
  },
  insurance: {
    keywords: ['life', 'health', 'aca', 'medicare', 'dental', 'vision', 'iul', 'final expense'],
    primaryEmail: process.env.SMTP_USER_INSURANCE || 'flofaction.insurance@gmail.com',
    ccEmail: process.env.SMTP_USER_HRI || 'paul@hriinsurance.com',
    category: 'OTHER_INSURANCE'
  },
  business: {
    keywords: ['ai', 'automation', 'web', 'marketing', 'saas', 'consulting', 'software'],
    primaryEmail: process.env.SMTP_USER_BUSINESS || 'flofaction.business@gmail.com',
    ccEmail: null,
    category: 'NON_INSURANCE'
  }
};

// Initialize transporters from environment variables
const hriTransporter = process.env.SMTP_HOST_HRI ? nodemailer.createTransport({
  host: process.env.SMTP_HOST_HRI,
  port: parseInt(process.env.SMTP_PORT_HRI || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER_HRI,
    pass: process.env.SMTP_PASS_HRI
  }
}) : null;

const insuranceTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST_INSURANCE || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT_INSURANCE || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER_INSURANCE,
    pass: process.env.SMTP_PASS_INSURANCE
  }
});

const businessTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST_BUSINESS || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT_BUSINESS || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER_BUSINESS,
    pass: process.env.SMTP_PASS_BUSINESS
  }
});

// Helper function to categorize product type
function categorizeProduct(productType, message = '') {
  const searchText = `${productType} ${message}`.toLowerCase();
  
  for (const [key, config] of Object.entries(emailRouting)) {
    if (config.keywords.some(keyword => searchText.includes(keyword))) {
      return config;
    }
  }
  
  // Default to business/unclassified
  return {
    ...emailRouting.business,
    category: 'UNCLASSIFIED',
    isUnclassified: true
  };
}

// Get appropriate transporter based on routing
function getTransporter(routing) {
  if (routing.primaryEmail && routing.primaryEmail.includes('hriinsurance')) {
    return hriTransporter || insuranceTransporter;
  } else if (routing.primaryEmail && routing.primaryEmail.includes('insurance')) {
    return insuranceTransporter;
  }
  return businessTransporter;
}

// Submit Intake Form Handler with Smart Routing
exports.submitIntake = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Set CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, HEAD');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Content-Type', 'application/json');
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
      }
      
      // Only POST
      if (req.method !== 'POST') {
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
      }
      
      const {
        firstName,
        lastName,
        email,
        phone,
        product_type,
        source_page,
        message,
        serviceType
      } = req.body;
      
      // Validation
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing: firstName, lastName, email'
        });
      }
      
      // Categorize the product
      const routing = categorizeProduct(product_type || serviceType || '', message || '');
      
      // Store in Firestore
      const docRef = await admin.firestore()
        .collection('intakeSubmissions')
        .add({
          firstName,
          lastName,
          email,
          phone: phone || '',
          product_type: product_type || serviceType || '',
          source_page: source_page || '',
          message: message || '',
          category: routing.category,
          assigned_to_email: routing.primaryEmail,
          is_unclassified: routing.isUnclassified || false,
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
          ipAddress: req.ip || 'unknown'
        });
      
      // Prepare email content
      const subjectTag = routing.isUnclassified ? '[UNCLASSIFIED] ' : '';
      const adminSubject = `${subjectTag}[NEW INTAKE] ${firstName} ${lastName} - ${routing.category}`;
      const adminBody = `
        <h2>New Intake Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Product Type:</strong> ${product_type || serviceType || 'Not specified'}</p>
        <p><strong>Category:</strong> ${routing.category}</p>
        <p><strong>Source:</strong> ${source_page || 'Unknown'}</p>
        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        <p><strong>Submission ID:</strong> ${docRef.id}</p>
        <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
      `;
      
      const clientSubject = 'We Received Your Submission - Flo Faction';
      const clientBody = `
        <h2>Thank You for Your Submission</h2>
        <p>Hello ${firstName},</p>
        <p>We have successfully received your intake form. Our team will review your information and contact you within 24 business hours.</p>
        <p>Your submission ID for reference: <strong>${docRef.id}</strong></p>
        <p>Best regards,<br/>Flo Faction Team</p>
      `;
      
      // Send emails to admin with CC
      const transporter = getTransporter(routing);
      const emailsToSend = [];
      
      const adminMailOptions = {
        from: routing.primaryEmail,
        to: routing.primaryEmail,
        ...(routing.ccEmail && { cc: routing.ccEmail }),
        subject: adminSubject,
        html: adminBody
      };
      
      const clientMailOptions = {
        from: routing.primaryEmail,
        to: email,
        subject: clientSubject,
        html: clientBody
      };
      
      emailsToSend.push(transporter.sendMail(adminMailOptions));
      emailsToSend.push(transporter.sendMail(clientMailOptions));
      
      // Send to n8n webhook if configured
      if (process.env.N8N_WEBHOOK_URL) {
        const webhookPayload = {
          firstName,
          lastName,
          email,
          phone,
          product_type: product_type || serviceType || '',
          category: routing.category,
          assigned_to_email: routing.primaryEmail,
          is_unclassified: routing.isUnclassified || false,
          source_page,
          message,
          submissionId: docRef.id,
          timestamp: new Date().toISOString()
        };
        
        emailsToSend.push(
          fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.N8N_WEBHOOK_TOKEN && { 'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN}` })
            },
            body: JSON.stringify(webhookPayload)
          }).catch(err => {
            console.error('n8n webhook error:', err);
            // Don't fail the whole operation if webhook fails
          })
        );
      }
      
      // Wait for all emails to send
      await Promise.all(emailsToSend);
      
      return res.status(200).json({
        success: true,
        message: 'Intake form submitted successfully',
        submissionId: docRef.id,
        routing: {
          category: routing.category,
          assigned_to: routing.primaryEmail,
          is_unclassified: routing.isUnclassified || false
        }
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Server error'
      });
    }
  });
});

// Health check endpoint
exports.health = functions.https.onRequest((req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// PHONE ARBITRAGE SYSTEM EXPORTS
// ============================================

// Route incoming calls (webhook for Twilio/Google Voice)
exports.routeCall = phoneArbitrage.routeCall;

// Handle inbound SMS (webhook)
exports.handleInboundSMS = phoneArbitrage.handleInboundSMS;

// Send campaign SMS
exports.sendSMS = phoneArbitrage.sendSMS;

// Create lead
exports.createLead = phoneArbitrage.createLead;

// Initiate outbound call
exports.initiateCall = phoneArbitrage.initiateCall;

// Run nurture campaign
exports.runNurtureCampaign = phoneArbitrage.runNurtureCampaign;

// Scheduled: Daily nurture
exports.dailyNurture = phoneArbitrage.dailyNurture;

// Scheduled: Hot lead follow-up
exports.hotLeadFollowup = phoneArbitrage.hotLeadFollowup;

// Phone system status
exports.getPhoneSystemStatus = phoneArbitrage.getPhoneSystemStatus;

// ============================================
// PAYMENT HANDLER EXPORTS
// ============================================

// Stripe payment
exports.createStripePayment = paymentHandlers.createStripePayment;

// PayPal payment
exports.createPayPalOrder = paymentHandlers.createPayPalOrder;

// Bitcoin payment
exports.createBitcoinPayment = paymentHandlers.createBitcoinPayment;

// Validate coupon
exports.validateCoupon = paymentHandlers.validateCoupon;

// Get order
exports.getOrder = paymentHandlers.getOrder;

// ============================================
// MANYCHAT INTEGRATION EXPORTS
// ============================================

// ManyChat webhook
exports.manychatWebhook = manychat.manychatWebhook;

// Sync subscriber
exports.syncSubscriber = manychat.syncSubscriber;

// ============================================
// AGENT HANDLER EXPORTS
// ============================================

// Process agent request
exports.processAgentRequest = agentHandler.processAgentRequest;

// ============================================
// LEAD MANAGEMENT EXPORTS
// ============================================

// Qualify lead
exports.qualifyLead = leadManagement.qualifyLead;

// Update lead status
exports.updateLeadStatus = leadManagement.updateLeadStatus;
