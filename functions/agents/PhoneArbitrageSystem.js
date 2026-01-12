/**
 * FLO FACTION PHONE ARBITRAGE SYSTEM
 * Complete call routing, SMS automation, and lead management
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 *
 * Phone Numbers:
 * - Google Voice: 772-208-9646 (Primary)
 * - AI Insurance Line: 772-777-8345
 * - Toll Free: 888-255-1191
 */

const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');

// ============================================
// PHONE ARBITRAGE CONFIGURATION
// ============================================
const ARBITRAGE_CONFIG = {
    // Phone Numbers
    phones: {
        primary: {
            number: '+17722089646',
            formatted: '772-208-9646',
            type: 'google_voice',
            purpose: 'Main Business Line'
        },
        aiAgent: {
            number: '+17727778345',
            formatted: '772-777-8345',
            type: 'elevenlabs',
            purpose: 'AI Insurance Specialist'
        },
        tollFree: {
            number: '+18882551191',
            formatted: '888-255-1191',
            type: 'toll_free',
            purpose: 'National Campaigns'
        }
    },

    // Business Hours (EST)
    businessHours: {
        timezone: 'America/New_York',
        weekday: { start: 9, end: 21 },  // 9 AM - 9 PM
        saturday: { start: 10, end: 18 }, // 10 AM - 6 PM
        sunday: { start: 12, end: 17 }    // 12 PM - 5 PM
    },

    // Lead Scoring
    leadScoring: {
        engagement: {
            call_completed: 50,
            sms_response: 30,
            form_filled: 40,
            appointment_booked: 100,
            quote_requested: 60
        },
        quality: {
            hot: { min: 150, action: 'immediate_call' },
            warm: { min: 80, action: 'scheduled_followup' },
            cold: { min: 0, action: 'nurture_sequence' }
        }
    },

    // Rate Limits
    limits: {
        sms: { perHour: 50, perDay: 200 },
        calls: { concurrent: 5, perDay: 100 }
    }
};

// ============================================
// CALL ROUTING ENGINE
// ============================================
class CallRoutingEngine {
    constructor() {
        this.db = getFirestore();
        this.activeAgents = new Map();
    }

    // Determine best route for incoming call
    async routeIncomingCall(callData) {
        const { from, to, callerName } = callData;

        // Check if existing lead
        const leadData = await this.lookupLead(from);

        // Determine routing based on:
        // 1. Time of day
        // 2. Caller history
        // 3. Agent availability
        // 4. Lead score

        const route = {
            action: 'route',
            destination: null,
            greeting: null,
            priority: 'normal'
        };

        // Business hours check
        if (!this.isBusinessHours()) {
            route.action = 'voicemail_ai';
            route.destination = ARBITRAGE_CONFIG.phones.aiAgent.number;
            route.greeting = 'after_hours';
            return route;
        }

        // Known high-value lead
        if (leadData && leadData.score >= ARBITRAGE_CONFIG.leadScoring.quality.hot.min) {
            route.priority = 'high';
            route.destination = ARBITRAGE_CONFIG.phones.primary.number;
            route.greeting = 'vip';
            return route;
        }

        // Check called number for routing
        if (to === ARBITRAGE_CONFIG.phones.aiAgent.number) {
            route.action = 'ai_agent';
            route.agentType = 'insurance_specialist';
            route.greeting = 'ai_insurance';
            return route;
        }

        // Default: AI triage first, then route to human
        route.action = 'ai_triage';
        route.destination = ARBITRAGE_CONFIG.phones.aiAgent.number;
        route.greeting = 'welcome';
        route.fallback = ARBITRAGE_CONFIG.phones.primary.number;

        return route;
    }

    // Route outbound calls
    async initiateOutboundCall(leadId, campaign, priority = 'normal') {
        const lead = await this.db.collection('leads').doc(leadId).get();

        if (!lead.exists) {
            return { success: false, error: 'Lead not found' };
        }

        const leadData = lead.data();

        // Select best caller ID based on campaign
        const callerId = this.selectCallerId(campaign);

        // Select AI agent or queue for human
        const agent = this.selectAgent(campaign, leadData);

        // Log call attempt
        await this.logCallAttempt(leadId, {
            campaign,
            callerId,
            agent,
            priority,
            timestamp: new Date()
        });

        return {
            success: true,
            callerId,
            agent,
            leadPhone: leadData.phone,
            script: this.getCallScript(campaign, leadData)
        };
    }

    // Select caller ID based on campaign
    selectCallerId(campaign) {
        const mapping = {
            'local': ARBITRAGE_CONFIG.phones.primary.number,
            'national': ARBITRAGE_CONFIG.phones.tollFree.number,
            'ai_agent': ARBITRAGE_CONFIG.phones.aiAgent.number,
            'default': ARBITRAGE_CONFIG.phones.primary.number
        };

        return mapping[campaign] || mapping.default;
    }

    // Select agent type
    selectAgent(campaign, leadData) {
        const productInterest = leadData.interests?.[0] || 'general';

        const agentMapping = {
            'life': 'life_insurance_specialist',
            'health': 'health_insurance_specialist',
            'medicare': 'medicare_specialist',
            'auto': 'auto_insurance_specialist',
            'wealth': 'wealth_advisor',
            'general': 'insurance_specialist'
        };

        return agentMapping[productInterest] || agentMapping.general;
    }

    // Get call script
    getCallScript(campaign, leadData) {
        return {
            opening: `Hi ${leadData.firstName || 'there'}, this is the Flo Faction insurance team. I'm calling because you showed interest in ${leadData.interests?.[0] || 'our services'}.`,
            qualification: [
                'Is this still a good time to talk?',
                'What\'s most important to you in coverage?',
                'Are you currently covered?',
                'What\'s your timeline for making a decision?'
            ],
            closing: 'I\'d love to get you some quotes. Can I schedule a brief consultation?'
        };
    }

    // Check business hours
    isBusinessHours() {
        const now = new Date();
        const options = { timeZone: ARBITRAGE_CONFIG.businessHours.timezone };
        const hour = parseInt(now.toLocaleString('en-US', { ...options, hour: 'numeric', hour12: false }));
        const day = now.toLocaleString('en-US', { ...options, weekday: 'short' });

        const dayConfig = ['Sun'].includes(day) ? 'sunday' :
            ['Sat'].includes(day) ? 'saturday' : 'weekday';

        const hours = ARBITRAGE_CONFIG.businessHours[dayConfig];
        return hour >= hours.start && hour < hours.end;
    }

    // Lookup lead
    async lookupLead(phone) {
        const normalized = phone.replace(/\D/g, '');
        const snapshot = await this.db.collection('leads')
            .where('phoneNormalized', '==', normalized)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    // Log call attempt
    async logCallAttempt(leadId, data) {
        await this.db.collection('call_logs').add({
            leadId,
            ...data,
            status: 'initiated'
        });
    }
}

// ============================================
// SMS CAMPAIGN ENGINE
// ============================================
class SMSCampaignEngine {
    constructor() {
        this.db = getFirestore();
        this.dailyCount = 0;
        this.hourlyCount = 0;
    }

    // Send campaign SMS
    async sendCampaignSMS(leadId, campaignType, customMessage = null) {
        // Rate limit check
        if (!this.checkRateLimits()) {
            return { success: false, error: 'Rate limit exceeded' };
        }

        const lead = await this.db.collection('leads').doc(leadId).get();
        if (!lead.exists) {
            return { success: false, error: 'Lead not found' };
        }

        const leadData = lead.data();
        const message = customMessage || this.getTemplateMessage(campaignType, leadData);

        // Log SMS
        const smsLog = await this.db.collection('sms_logs').add({
            leadId,
            phone: leadData.phone,
            message,
            campaignType,
            direction: 'outbound',
            status: 'queued',
            timestamp: new Date()
        });

        this.hourlyCount++;
        this.dailyCount++;

        return {
            success: true,
            smsId: smsLog.id,
            message,
            phone: leadData.phone
        };
    }

    // Process inbound SMS
    async processInboundSMS(from, body) {
        const lead = await this.lookupOrCreateLead(from);
        const intent = this.detectIntent(body);

        // Log inbound
        await this.db.collection('sms_logs').add({
            leadId: lead.id,
            phone: from,
            message: body,
            direction: 'inbound',
            intent,
            timestamp: new Date()
        });

        // Update lead score
        await this.updateLeadScore(lead.id, 'sms_response');

        // Generate auto-response
        const response = await this.generateResponse(intent, lead, body);

        return {
            success: true,
            intent,
            response,
            leadId: lead.id
        };
    }

    // Detect message intent
    detectIntent(body) {
        const lowerBody = body.toLowerCase();

        const intents = {
            'STOP': { type: 'optout', action: 'unsubscribe' },
            'QUOTE': { type: 'quote_request', action: 'get_quote' },
            'CALL': { type: 'call_request', action: 'schedule_call' },
            'DYNASTY': { type: 'product_interest', product: 'dynasty_strategy' },
            'WATERFALL': { type: 'product_interest', product: 'waterfall_method' },
            'HELP': { type: 'help_request', action: 'send_info' },
            'YES': { type: 'positive_response', action: 'continue_conversation' },
            'NO': { type: 'negative_response', action: 'acknowledge' }
        };

        for (const [keyword, intent] of Object.entries(intents)) {
            if (lowerBody.includes(keyword.toLowerCase())) {
                return intent;
            }
        }

        // AI intent detection for complex messages
        if (lowerBody.includes('insurance') || lowerBody.includes('quote') || lowerBody.includes('coverage')) {
            return { type: 'inquiry', action: 'qualify_lead' };
        }

        if (lowerBody.includes('price') || lowerBody.includes('cost') || lowerBody.includes('how much')) {
            return { type: 'price_inquiry', action: 'provide_info' };
        }

        return { type: 'general', action: 'ai_response' };
    }

    // Generate response
    async generateResponse(intent, lead, originalMessage) {
        const responses = {
            optout: 'You have been unsubscribed. Reply START to resubscribe.',
            quote_request: `Thanks ${lead.firstName || ''}! To get your personalized quote, visit flofaction.com/intake or call 772-208-9646. What type of insurance are you looking for?`,
            call_request: `Great! You can reach us at 772-208-9646. Would you prefer us to call you? Reply with a good time.`,
            product_interest: `Excellent choice! The ${intent.product?.replace('_', ' ')} is perfect for building generational wealth. Let's schedule a quick call to discuss your goals. Reply CALL or visit flofaction.com/intake`,
            positive_response: `Awesome! Let me help you further. What questions do you have about insurance or wealth building?`,
            negative_response: `No problem! If you ever have questions about insurance or financial planning, we're here to help. Reply anytime!`,
            inquiry: `Thanks for reaching out! I can help with life, health, auto, and home insurance. What coverage are you interested in?`,
            price_inquiry: `Great question! Pricing depends on your specific needs. For a personalized quote, reply QUOTE or call 772-208-9646.`,
            general: `Thanks for your message! How can I help you today? Reply QUOTE for insurance quotes, or CALL to speak with an agent.`
        };

        return responses[intent.type] || responses.general;
    }

    // Get template message
    getTemplateMessage(campaignType, leadData) {
        const templates = {
            dynasty: `Hey ${leadData.firstName || 'there'}! 👋 The Dynasty Strategy can help you build generational wealth through permanent life insurance. Tax-free death benefits + cash value growth. Reply DYNASTY to learn more! 📞 772-208-9646`,
            waterfall: `${leadData.firstName || 'Hey'}! 👋 Ever heard of the Waterfall Method? Use IUL policy loans for tax-free retirement income. The wealthy have done this for decades. Reply WATERFALL for details! 📞 772-208-9646`,
            auto_quote: `Hi ${leadData.firstName || 'there'}! Thanks for your interest in auto insurance. We work with 7+ carriers to find you the best rates. Reply QUOTE to get started! 📞 772-208-9646`,
            life_followup: `${leadData.firstName || 'Hey'}! Just following up on your life insurance inquiry. Have you had a chance to think about your coverage needs? Reply or call 772-208-9646`,
            appointment_reminder: `Reminder: You have an appointment with Flo Faction tomorrow. Questions? Call 772-208-9646. Reply CONFIRM to confirm.`,
            nurture: `${leadData.firstName || 'Hey'}! Did you know most families are underinsured? Let's make sure your loved ones are protected. Free consultation: 772-208-9646`
        };

        return templates[campaignType] || templates.nurture;
    }

    // Check rate limits
    checkRateLimits() {
        return this.hourlyCount < ARBITRAGE_CONFIG.limits.sms.perHour &&
               this.dailyCount < ARBITRAGE_CONFIG.limits.sms.perDay;
    }

    // Lookup or create lead
    async lookupOrCreateLead(phone) {
        const normalized = phone.replace(/\D/g, '');
        const snapshot = await this.db.collection('leads')
            .where('phoneNormalized', '==', normalized)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }

        // Create new lead
        const newLead = await this.db.collection('leads').add({
            phone,
            phoneNormalized: normalized,
            source: 'sms_inbound',
            score: 10,
            status: 'new',
            createdAt: new Date()
        });

        return { id: newLead.id, phone, score: 10 };
    }

    // Update lead score
    async updateLeadScore(leadId, action) {
        const points = ARBITRAGE_CONFIG.leadScoring.engagement[action] || 10;
        const leadRef = this.db.collection('leads').doc(leadId);

        await leadRef.update({
            score: getFirestore.FieldValue.increment(points),
            lastActivity: new Date(),
            [`activities.${action}`]: getFirestore.FieldValue.increment(1)
        });
    }
}

// ============================================
// LEAD MANAGEMENT ENGINE
// ============================================
class LeadManagementEngine {
    constructor() {
        this.db = getFirestore();
        this.callRouter = new CallRoutingEngine();
        this.smsEngine = new SMSCampaignEngine();
    }

    // Create lead from intake form
    async createLead(leadData) {
        const normalized = leadData.phone?.replace(/\D/g, '') || '';

        const lead = {
            ...leadData,
            phoneNormalized: normalized,
            score: this.calculateInitialScore(leadData),
            status: 'new',
            source: leadData.source || 'website',
            createdAt: new Date(),
            updatedAt: new Date(),
            activities: {},
            tags: this.generateTags(leadData)
        };

        const docRef = await this.db.collection('leads').add(lead);

        // Trigger welcome sequence
        await this.triggerWelcomeSequence(docRef.id, lead);

        return { id: docRef.id, ...lead };
    }

    // Calculate initial score
    calculateInitialScore(leadData) {
        let score = 10;

        if (leadData.email) score += 10;
        if (leadData.phone) score += 15;
        if (leadData.interests?.length > 0) score += 20;
        if (leadData.budget) score += 15;
        if (leadData.timeline === 'immediate') score += 30;
        if (leadData.source === 'referral') score += 25;

        return score;
    }

    // Generate tags
    generateTags(leadData) {
        const tags = [];

        if (leadData.interests) {
            tags.push(...leadData.interests.map(i => `interest:${i}`));
        }
        if (leadData.source) {
            tags.push(`source:${leadData.source}`);
        }
        if (leadData.state) {
            tags.push(`state:${leadData.state}`);
        }

        return tags;
    }

    // Trigger welcome sequence
    async triggerWelcomeSequence(leadId, lead) {
        // Send welcome SMS
        if (lead.phone) {
            await this.smsEngine.sendCampaignSMS(leadId, 'welcome',
                `Welcome to Flo Faction, ${lead.firstName || ''}! 🎉 Thanks for your interest in ${lead.interests?.[0] || 'our services'}. A specialist will contact you within 24 hours. Questions? Call 772-208-9646`
            );
        }

        // Schedule follow-up call
        await this.db.collection('scheduled_actions').add({
            leadId,
            action: 'followup_call',
            scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            status: 'pending',
            priority: lead.score >= 80 ? 'high' : 'normal'
        });
    }

    // Get leads for campaign
    async getLeadsForCampaign(criteria) {
        let query = this.db.collection('leads');

        if (criteria.minScore) {
            query = query.where('score', '>=', criteria.minScore);
        }
        if (criteria.status) {
            query = query.where('status', '==', criteria.status);
        }
        if (criteria.tag) {
            query = query.where('tags', 'array-contains', criteria.tag);
        }

        const snapshot = await query.limit(criteria.limit || 100).get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Run nurture campaign
    async runNurtureCampaign(campaignConfig) {
        const leads = await this.getLeadsForCampaign(campaignConfig.criteria);

        const results = {
            total: leads.length,
            sent: 0,
            failed: 0,
            skipped: 0
        };

        for (const lead of leads) {
            // Check opt-out status
            if (lead.optedOut) {
                results.skipped++;
                continue;
            }

            const result = await this.smsEngine.sendCampaignSMS(
                lead.id,
                campaignConfig.type
            );

            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
            }

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Log campaign
        await this.db.collection('campaign_logs').add({
            ...campaignConfig,
            results,
            completedAt: new Date()
        });

        return results;
    }
}

// ============================================
// FIREBASE CLOUD FUNCTIONS
// ============================================

// Initialize engines
let callRouter, smsEngine, leadEngine;

const initializeEngines = () => {
    if (!callRouter) {
        callRouter = new CallRoutingEngine();
        smsEngine = new SMSCampaignEngine();
        leadEngine = new LeadManagementEngine();
    }
};

// Route incoming call
exports.routeCall = onRequest({ cors: true }, async (req, res) => {
    initializeEngines();

    const { from, to, callerName } = req.body;
    const route = await callRouter.routeIncomingCall({ from, to, callerName });

    res.json(route);
});

// Handle inbound SMS
exports.handleInboundSMS = onRequest({ cors: true }, async (req, res) => {
    initializeEngines();

    const { from, body } = req.body;
    const result = await smsEngine.processInboundSMS(from, body);

    res.json(result);
});

// Send campaign SMS
exports.sendSMS = onCall({ cors: true }, async (request) => {
    initializeEngines();

    const { leadId, campaignType, customMessage } = request.data;
    return await smsEngine.sendCampaignSMS(leadId, campaignType, customMessage);
});

// Create lead
exports.createLead = onCall({ cors: true }, async (request) => {
    initializeEngines();

    const leadData = request.data;
    return await leadEngine.createLead(leadData);
});

// Initiate outbound call
exports.initiateCall = onCall({ cors: true }, async (request) => {
    initializeEngines();

    const { leadId, campaign, priority } = request.data;
    return await callRouter.initiateOutboundCall(leadId, campaign, priority);
});

// Run nurture campaign
exports.runNurtureCampaign = onCall({ cors: true }, async (request) => {
    initializeEngines();

    const campaignConfig = request.data;
    return await leadEngine.runNurtureCampaign(campaignConfig);
});

// Scheduled: Daily nurture campaign
exports.dailyNurture = onSchedule('every day 10:00', async (event) => {
    initializeEngines();

    await leadEngine.runNurtureCampaign({
        type: 'nurture',
        criteria: {
            status: 'nurture',
            minScore: 30
        }
    });
});

// Scheduled: Hot lead follow-up
exports.hotLeadFollowup = onSchedule('every 2 hours', async (event) => {
    initializeEngines();

    const hotLeads = await leadEngine.getLeadsForCampaign({
        minScore: 150,
        status: 'new',
        limit: 10
    });

    for (const lead of hotLeads) {
        await callRouter.initiateOutboundCall(lead.id, 'local', 'high');
    }
});

// Get phone system status
exports.getPhoneSystemStatus = onRequest({ cors: true }, async (req, res) => {
    initializeEngines();

    res.json({
        status: 'operational',
        phones: ARBITRAGE_CONFIG.phones,
        businessHours: callRouter.isBusinessHours(),
        limits: {
            sms: {
                hourly: `${smsEngine.hourlyCount}/${ARBITRAGE_CONFIG.limits.sms.perHour}`,
                daily: `${smsEngine.dailyCount}/${ARBITRAGE_CONFIG.limits.sms.perDay}`
            }
        },
        timestamp: new Date().toISOString()
    });
});

// Export engines for use in other modules
module.exports = {
    CallRoutingEngine,
    SMSCampaignEngine,
    LeadManagementEngine,
    ARBITRAGE_CONFIG
};
