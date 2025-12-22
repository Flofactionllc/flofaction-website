const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const nodemailer = require('nodemailer');
const axios = require('axios');

admin.initializeApp();

const GEMINI_API_KEY = 'AlzaSyAIfXpcGndNb2dNHs07_QcAi6Od37_DACw';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'flofactionllc@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'nucv fyic nouc hdka'
  }
});

// Submit Intake Form Handler - Routes to service-type specific inboxes and SENDS EMAIL
exports.submitIntake = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { serviceType, firstName, lastName, email, phone, contactPreference, message, timestamp, submittedFrom } = req.body;
      
      // Validation
      if (!serviceType || !firstName || !email) {
        return res.status(400).json({ error: 'Service type, first name, and email are required' });
      }
      
      // Service-type to email mapping
      const serviceTypeRouting = {
        // Insurance & Finance Services -> flofaction.insurance
        'waterfall': 'flofaction.insurance@gmail.com',
        'banking': 'flofaction.insurance@gmail.com',
        'life-insurance': 'flofaction.insurance@gmail.com',
        'wealth-management': 'flofaction.insurance@gmail.com',
        'legacy-planning': 'flofaction.insurance@gmail.com',
        
        // Business services -> flofaction.business
        'healthcare': 'flofaction.business@gmail.com',
        'travel': 'flofaction.business@gmail.com',
        'real-estate': 'flofaction.business@gmail.com',
        'tax': 'flofaction.business@gmail.com',
        'retirement': 'flofaction.business@gmail.com',
        
        // Creative Services -> flofaction.business
        'web-dev': 'flofaction.business@gmail.com',
        'music': 'flofaction.business@gmail.com',
        'videography': 'flofaction.business@gmail.com',
        'portfolio': 'flofaction.business@gmail.com',
        
        // Emergency -> flofaction.insurance
        'emergency': 'flofaction.insurance@gmail.com'
      };
      
      const recipientEmail = serviceTypeRouting[serviceType] || 'flofaction.business@gmail.com';
      
      // Create email content
      const emailContent = `
        New Intake Form Submission
        
        Service Type: ${serviceType}
        Name: ${firstName} ${lastName}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Date of Birth: ${req.body.dateOfBirth || 'Not provided'}
        Preferred Contact: ${contactPreference || 'Email'}
        
        Message/Details:
        ${message || 'No additional details provided'}
        
        Submitted From: ${submittedFrom || 'Unknown'}
        Timestamp: ${new Date().toISOString()}
      `;
      
      // Send email to recipient
      const mailOptions = {
        from: 'flofactionllc@gmail.com',
        to: recipientEmail,
        subject: `New ${serviceType} Intake Form - ${firstName} ${lastName}`,
        text: emailContent,
        replyTo: email
      };
      
      // Send the email
      await transporter.sendMail(mailOptions);
      
      // Store submission in Firestore
      await admin.firestore().collection('intakeSubmissions').add({
        serviceType,
        firstName,
        lastName,
        email,
        phone: phone || '',
        contactPreference: contactPreference || 'email',
        message: message || '',
        submittedFrom: submittedFrom || '',
        recipientEmail,
        emailSent: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new',
        readAt: null
      });
      
      res.status(200).json({
        success: true,
        message: 'Intake form submitted successfully and email sent',
        recipientEmail
      });
    } catch (error) {
      console.error('Intake submission error:', error);
      res.status(500).json({
        error: 'Failed to process intake form',
        details: error.message
      });
    }
  });
});

// Contact Form Handler
exports.contact = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { email, message, name } = req.body;
      if (!email || !message) {
        return res.status(400).json({ error: 'Email and message required' });
      }

      await admin.firestore().collection('contacts').add({
        email,
        message,
        name: name || 'Anonymous',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      });

      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully',
        id: email
      });
    } catch (error) {
      console.error('Contact error:', error);
      res.status(500).json({
        error: 'Failed to process contact form',
        details: error.message
      });
    }
  });
});

// Batch Calling Handler with ElevenLabs
exports.batchCall = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { phoneNumber, name, email, agentId } = req.body;
      if (!phoneNumber || !agentId) {
        return res.status(400).json({ error: 'Phone number and agent ID required' });
      }

      const callRecord = await admin.firestore().collection('batch_calls').add({
        phoneNumber,
        name: name || 'Unknown',
        email: email || '',
        agentId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'initiated',
        recordingUrl: ''
      });

      res.status(200).json({
        success: true,
        message: 'Batch call initiated',
        callId: callRecord.id
      });
    } catch (error) {
      console.error('Batch call error:', error);
      res.status(500).json({
        error: 'Failed to initiate batch call',
        details: error.message
      });
    }
  });
});

// Get Submissions Handler
exports.getSubmissions = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await admin.firestore().collection('contacts')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      const submissions = [];
      snapshot.forEach(doc => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
      });
    } catch (error) {
      console.error('Get submissions error:', error);
      res.status(500).json({
        error: 'Failed to retrieve submissions',
        details: error.message
      });
    }
  });
});
