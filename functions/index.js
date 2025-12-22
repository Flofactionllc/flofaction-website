const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const axios = require('axios');

admin.initializeApp();

const GEMINI_API_KEY = 'AlzaSyAIfXpcGndNb2dNHs07_QcAi6Od37_DACw';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Submit Intake Form Handler
exports.submitIntake = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
      const { serviceType, firstName, lastName, email, phone, dateOfBirth, contactPreference, message, submittedFrom } = req.body;

      // Validation
      if (!serviceType || !firstName || !email) {
        return res.status(400).json({ success: false, error: 'Service type, first name, and email are required' });
      }

      // Store in Firestore
      const doc = await admin.firestore().collection('intakeSubmissions').add({
        serviceType,
        firstName,
        lastName,
        email,
        phone: phone || '',
        dateOfBirth: dateOfBirth || '',
        contactPreference: contactPreference || 'email',
        message: message || '',
        submittedFrom: submittedFrom || '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      });

      return res.status(200).json({
        success: true,
        message: 'Intake form submitted successfully',
        docId: doc.id
      });
    } catch (error) {
      console.error('Intake submission error:', error);
      return res.status(500).json({
        success: false,
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
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    try {
      const { email, message, name } = req.body;
      if (!email || !message) {
        return res.status(400).json({ success: false, error: 'Email and message required' });
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
        message: 'Contact form submitted successfully'
      });
    } catch (error) {
      console.error('Contact error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process contact form',
        details: error.message
      });
    }
  });
});

// Batch Call Handler
exports.batchCall = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    try {
      const { phoneNumber, name, email, agentId } = req.body;
      if (!phoneNumber || !agentId) {
        return res.status(400).json({ success: false, error: 'Phone number and agent ID required' });
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
        success: false,
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
        success: false,
        error: 'Failed to retrieve submissions',
        details: error.message
      });
    }
  });
});
