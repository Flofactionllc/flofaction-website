const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const axios = require('axios');

admin.initializeApp();

const GEMINI_API_KEY = 'AlzaSyAIfXpcGndNb2dNHs07_QcAi6Od37_DACw';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Contact Form Handler
exports.contact = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { email, message, name } = req.body;

      // Validation
      if (!email || !message) {
        return res.status(400).json({ error: 'Email and message required' });
      }

      // Store in Firestore
      await admin.firestore().collection('contacts').add({
        email,
        message,
        name: name || 'Anonymous',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      });

      // Send to Gemini for processing (optional)
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Process this customer inquiry: ${message}`
            }]
          }]
        }
      );

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

      // Create batch call record
      const callRecord = await admin.firestore().collection('batch_calls').add({
        phoneNumber,
        name: name || 'Unknown',
        email: email || '',
        agentId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'initiated',
        recordingUrl: ''
      });

      // Trigger ElevenLabs call (would integrate with their API)
      // This is a placeholder for actual ElevenLabs integration

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

// Submit Intake Form Handler - Routes to service-type specific inboxes
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
        'WATERFALL': 'waterfall@flofaction.com',
        'BANK': 'banking@flofaction.com',
        'LIFE': 'lifeinsurance@flofaction.com',
        'WEALTH': 'wealth@flofaction.com',
        'LEGACY': 'legacy@flofaction.com'
      };
      
      const recipientEmail = serviceTypeRouting[serviceType] || 'flofaction.insurance@gmail.com';
      
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
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new',
        readAt: null
      });
      
      res.status(200).json({
        success: true,
        message: 'Intake form submitted successfully',
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
