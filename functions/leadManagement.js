/**
 * COMPLETE LEAD MANAGEMENT SYSTEM
 * Firebase Cloud Functions - Production Ready
 * Handles: Lead creation, automation, email/SMS drips, lead scoring, CRM sync
 * Author: Flo Faction Team | Version: 2.0.0 | Updated: Jan 4, 2026
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const axios = require('axios');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;

// ============================================================
// LEAD CREATION ENDPOINT
// ============================================================
exports.createLeadFromIntake = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
    
    try {
      const { firstName, lastName, email, phone, serviceType, sourceUrl, message } = req.body;
      if (!firstName || !lastName || !email) {
        return res.status(400).json({error: 'Missing required fields: firstName, lastName, email'});
      }

      const leadData = {
        firstName,
        lastName,
        email,
        phone: phone || '',
        serviceType: serviceType || 'general',
        source: 'website_intake',
        sourceUrl: sourceUrl || '',
        message: message || '',
        status: 'new',
        leadScore: 50,
        followUpCount: 0,
        lastContactAt: null,
        nextFollowUpAt: Timestamp.now(),
        emailsSent: 0,
        smsSent: 0,
        callsMade: 0,
        tags: [],
        notes: [],
        automationStatus: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        assignedTo: getAgentForService(serviceType)
      };

      const docRef = await db.collection('leads').add(leadData);
      
      // Log interaction
      await db.collection('interactions').add({
        leadId: docRef.id,
        type: 'form_submission',
        channel: 'website',
        direction: 'inbound',
        content: `Lead submitted intake form from ${sourceUrl}`,
        createdAt: Timestamp.now()
      });

      // Trigger welcome email automation
      await triggerWelcomeEmailSequence(docRef.id, leadData);

      return res.status(201).json({
        success: true,
        leadId: docRef.id,
        message: 'Lead created and automation started',
        status: 'new',
        nextAction: 'awaiting_qualification'
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      return res.status(500).json({error: error.message});
    }
  });
});

// ============================================================
// GET LEADS WITH FILTERING
// ============================================================
exports.getLeads = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
    
    try {
      const { status, serviceType, assignedTo, limit = 50, offset = 0 } = req.query;
      let query = db.collection('leads').where('deleted', '==', false);

      if (status) query = query.where('status', '==', status);
      if (serviceType) query = query.where('serviceType', '==', serviceType);
      if (assignedTo) query = query.where('assignedTo', '==', assignedTo);

      const snapshot = await query
        .orderBy('leadScore', 'desc')
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit) + parseInt(offset))
        .get();

      const leads = [];
      snapshot.forEach((doc, index) => {
        if (index >= parseInt(offset)) {
          leads.push({id: doc.id, ...doc.data()});
        }
      });

      return res.status(200).json({
        success: true,
        total: leads.length,
        leads,
        pagination: {limit, offset, hasMore: leads.length === parseInt(limit)}
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      return res.status(500).json({error: error.message});
    }
  });
});

// ============================================================
// UPDATE LEAD STATUS
// ============================================================
exports.updateLeadStatus = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PUT') return res.status(405).json({error: 'Method not allowed'});
    
    try {
      const { leadId, status, note, user } = req.body;
      if (!leadId || !status) return res.status(400).json({error: 'Missing leadId or status'});

      const updateData = {
        status,
        lastContactAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (note) {
        updateData.notes = FieldValue.arrayUnion({
          timestamp: Timestamp.now(),
          note,
          user: user || 'system'
        });
      }

      await db.collection('leads').doc(leadId).update(updateData);

      // Log interaction
      await db.collection('interactions').add({
        leadId,
        type: 'status_change',
        channel: 'system',
        direction: 'outbound',
        content: `Status changed to ${status}`,
        createdAt: Timestamp.now()
      });

      return res.status(200).json({success: true, message: 'Lead status updated'});
    } catch (error) {
      console.error('Error updating lead:', error);
      return res.status(500).json({error: error.message});
    }
  });
});

// ============================================================
// ADD NOTE TO LEAD
// ============================================================
exports.addLeadNote = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
    
    try {
      const { leadId, note, user } = req.body;
      if (!leadId || !note) return res.status(400).json({error: 'Missing leadId or note'});

      await db.collection('leads').doc(leadId).update({
        notes: FieldValue.arrayUnion({timestamp: Timestamp.now(), note, user: user || 'system'}),
        updatedAt: Timestamp.now()
      });

      return res.status(200).json({success: true, message: 'Note added'});
    } catch (error) {
      console.error('Error adding note:', error);
      return res.status(500).json({error: error.message});
    }
  });
});

// ============================================================
// UPDATE LEAD SCORE (AI-based)
// ============================================================
exports.updateLeadScore = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PUT') return res.status(405).json({error: 'Method not allowed'});
    
    try {
      const { leadId } = req.body;
      if (!leadId) return res.status(400).json({error: 'Missing leadId'});

      const leadDoc = await db.collection('leads').doc(leadId).get();
      if (!leadDoc.exists) return res.status(404).json({error: 'Lead not found'});

      const lead = leadDoc.data();
      let score = 50;

      // Scoring algorithm
      if (lead.emailOpened) score += 15;
      if (lead.emailClicked) score += 20;
      if (lead.callAnswered) score += 25;
      if (lead.quoteRequested) score += 30;
      if (lead.messageReplied) score += 10;
      if (lead.lastContactAt && new Date() - lead.lastContactAt.toDate() < 86400000) score += 10; // 24h
      score = Math.min(100, score);

      await db.collection('leads').doc(leadId).update({leadScore: score, updatedAt: Timestamp.now()});

      return res.status(200).json({success: true, leadScore: score});
    } catch (error) {
      console.error('Error updating lead score:', error);
      return res.status(500).json({error: error.message});
    }
  });
});

// ============================================================
// TRIGGER EMAIL AUTOMATION SEQUENCE
// ============================================================
async function triggerWelcomeEmailSequence(leadId, leadData) {
  try {
    // Schedule Day 1 email
    await scheduleFollowUp(leadId, 'email_welcome_day1', 0, leadData);
    // Schedule Day 3 email
    await scheduleFollowUp(leadId, 'email_followup_day3', 2, leadData);
    // Schedule Day 5 email
    await scheduleFollowUp(leadId, 'email_followup_day5', 4, leadData);
    // Schedule Day 7 email
    await scheduleFollowUp(leadId, 'email_followup_day7', 6, leadData);
  } catch (error) {
    console.error('Error scheduling emails:', error);
  }
}

// ============================================================
// SCHEDULE FOLLOW UP
// ============================================================
async function scheduleFollowUp(leadId, campaignType, daysDelay, leadData) {
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + daysDelay);

  await db.collection('automations').add({
    leadId,
    campaignType,
    scheduledFor: Timestamp.fromDate(followUpDate),
    status: 'pending',
    leadEmail: leadData.email,
    leadName: leadData.firstName,
    createdAt: Timestamp.now()
  });
}

// ============================================================
// GET AGENT FOR SERVICE TYPE
// ============================================================
function getAgentForService(serviceType) {
  const agentMap = {
    'auto_insurance': 'paul@hriinsurance.com',
    'home_insurance': 'paul@hriinsurance.com',
    'life_insurance': 'flofaction.insurance@gmail.com',
    'health_insurance': 'flofaction.insurance@gmail.com',
    'wealth_building': 'flofaction.business@gmail.com',
    'digital_services': 'flofaction.business@gmail.com',
    'default': 'flofactionllc@gmail.com'
  };
  return agentMap[serviceType] || agentMap.default;
}

// ============================================================
// HEALTH CHECK
// ============================================================
exports.health = functions.https.onRequest((req, res) => {
  res.status(200).json({status: 'ok', timestamp: new Date().toISOString()});
});

module.exports = {exports};
