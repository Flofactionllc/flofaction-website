const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const nodemailer = require('nodemailer');

admin.initializeApp();

// Gmail SMTP configuration using app passwords
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
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    try {
      const { serviceType, firstName, lastName, email, phone, dateOfBirth, contactPreference, message, submittedFrom } = req.body;
      
      // Validation
      if (!serviceType || !firstName || !lastName || !email) {
        return res.status(400).json({ success: false, error: 'Service type, first name, last name, and email are required' });
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
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip || 'unknown'
      });
      
      // Email content
      const emailContent = `
        <h2>New Client Intake Submission</h2>
        <p><strong>Submission ID:</strong> ${doc.id}</p>
        <p><strong>Service Type:</strong> ${serviceType}</p>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Date of Birth:</strong> ${dateOfBirth || 'Not provided'}</p>
        <p><strong>Preferred Contact Method:</strong> ${contactPreference || 'Email'}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message provided'}</p>
        <p><strong>Submitted From:</strong> ${submittedFrom || 'Unknown'}</p>
        <p><strong>Submitted At:</strong> ${new Date().toISOString()}</p>
      `;
      
      // Send emails to both accounts
      const mailOptions = {
        from: 'flofaction.insurance@gmail.com',
        to: email,
        cc: 'flofaction.business@gmail.com',
        subject: `Flo Faction - Intake Form Submission Confirmation - ${serviceType}`,
        html: `
          <h2>Thank You for Your Submission</h2>
          <p>Dear ${firstName},</p>
          <p>We have received your intake form submission. Our team will review your information and contact you shortly.</p>
          <hr>
          <h3>Your Submission Details:</h3>
          ${emailContent}
          <hr>
          <p>Best regards,<br/>Flo Faction Team</p>
        `
      };
      
      const adminMailOptions = {
        from: 'flofaction.insurance@gmail.com',
        to: 'flofaction.insurance@gmail.com',
        bcc: 'flofaction.business@gmail.com',
        subject: `[NEW CLIENT] ${firstName} ${lastName} - ${serviceType}`,
        html: emailContent
      };
      
      // Send confirmation email to client
      await transporter.sendMail(mailOptions);
      
      // Send notification to admin
      await transporter.sendMail(adminMailOptions);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Form submitted successfully. Check your email for confirmation.',
        submissionId: doc.id
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Error processing form submission'
      });
    }
  });
});
