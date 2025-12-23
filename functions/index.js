const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const nodemailer = require('nodemailer');

admin.initializeApp();

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'flofaction.insurance@gmail.com',
    pass: 'nuio kske xhaf dihi'
  }
});

const businessTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'flofaction.business@gmail.com',
    pass: 'ryki ftcc juqx xqvr'
  }
});

// Submit Intake Form Handler
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
        return res.status(405).json({\n          success: false,\n          error: 'Method not allowed'\n        });
      }
      
      const { serviceType, firstName, lastName, email, phone, dateOfBirth, contactPreference, message, submittedFrom } = req.body;
      
      // Validation
      if (!serviceType || !firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing'
        });
      }
      
      // Store in Firestore
      const docRef = await admin.firestore()
        .collection('intakeSubmissions')
        .add({
          serviceType, firstName, lastName, email,
          phone: phone || '',
          dateOfBirth: dateOfBirth || '',
          contactPreference: contactPreference || 'email',
          message: message || '',
          submittedFrom: submittedFrom || '',
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
          ipAddress: req.ip || 'unknown'
        });
      
      // Email content
      const emailContent = `<h2>New Intake</h2><p>Name: ${firstName} ${lastName}</p><p>Email: ${email}</p><p>Service: ${serviceType}</p><p>Message: ${message}</p>`;
      
      // Send emails
      await Promise.all([
        transporter.sendMail({
          from: 'flofaction.insurance@gmail.com',
          to: 'flofaction.insurance@gmail.com,flofaction.business@gmail.com',
          subject: `[NEW CLIENT] ${firstName} ${lastName}`,
          html: emailContent
        }),
        transporter.sendMail({
          from: 'flofaction.insurance@gmail.com',
          to: email,
          subject: 'Thank You',
          html: `<p>Thank you ${firstName}, we received your submission</p>`
        })
      ]);
      
      return res.status(200).json({
        success: true,
        message: 'Form submitted',
        submissionId: docRef.id
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
