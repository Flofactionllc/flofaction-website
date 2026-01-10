/**
 * GOOGLE VOICE SMS INTEGRATION
 * Automated SMS outreach and response handling
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 *
 * Phone: 772-208-9646
 * Account: flofactionllc@gmail.com
 */

const { FloFactionAgent } = require('../core/HiveMindCore');

// ============================================
// CONFIGURATION
// ============================================
const GOOGLE_VOICE_CONFIG = {
    phoneNumber: '+17722089646',
    formattedNumber: '772-208-9646',
    account: 'flofactionllc@gmail.com',
    maxSMSPerHour: 50,
    maxSMSPerDay: 200,
    timezone: 'America/New_York',

    // Business hours for outreach
    businessHours: {
        start: 9,  // 9 AM
        end: 21,   // 9 PM
        days: [1, 2, 3, 4, 5, 6] // Mon-Sat
    },

    // SMS Character limits
    limits: {
        singleSMS: 160,
        concatenated: 918 // 6 segments max
    }
};

// ============================================
// SMS TEMPLATES
// ============================================
const SMS_TEMPLATES = {
    // TikTok/Instagram Outreach
    dynasty: {
        name: 'Dynasty Strategy Follow-up',
        template: `Hey {firstName}! 👋 Thanks for engaging with our Dynasty Strategy content on {platform}!

You clearly understand building generational wealth. Let's talk about how permanent life insurance can work for YOUR family.

Text DYNASTY for a custom plan.
📞 772-208-9646
🌐 flofaction.com/intake`,
        keywords: ['dynasty', 'generational', 'legacy', 'wealth transfer']
    },

    waterfall: {
        name: 'Waterfall Method Follow-up',
        template: `Hey {firstName}! 👋 You mentioned the Waterfall strategy - you're thinking like the wealthy!

Here's the power of IUL:
✅ Tax-free loans from YOUR policy
✅ Keep the interest yourself
✅ Retirement income without taxes

Let's map out YOUR waterfall.
📞 772-208-9646`,
        keywords: ['waterfall', 'infinite banking', 'iul', 'tax free']
    },

    rockefeller: {
        name: 'Rockefeller Banking Follow-up',
        template: `{firstName}! 👋 Love that you're interested in the Rockefeller method!

This is how the wealthy STAY wealthy:
✅ Build cash value
✅ Borrow against it (not from banks)
✅ Repay yourself + keep interest
✅ Repeat for generations

Ready to bank like Rockefeller?
📞 772-208-9646`,
        keywords: ['rockefeller', 'banking secrets', 'be your own bank']
    },

    // Insurance Specific
    autoQuote: {
        name: 'Auto Insurance Quote Follow-up',
        template: `Hi {firstName}! 👋 Thanks for your interest in auto insurance!

I can help you find great coverage at competitive rates. To get your personalized quote, I just need a few details.

Call/text me: 772-208-9646
Or visit: flofaction.com/intake

- Paul @ Flo Faction`,
        keywords: ['auto', 'car', 'vehicle', 'insurance quote']
    },

    lifeInsurance: {
        name: 'Life Insurance Follow-up',
        template: `Hi {firstName}! 👋 Protecting your family is so important.

I specialize in life insurance solutions that ALSO build wealth:
✅ Term Life for pure protection
✅ IUL for tax-free retirement
✅ Whole Life for guarantees

Let's find your perfect fit.
📞 772-208-9646`,
        keywords: ['life', 'protection', 'family', 'coverage']
    },

    medicare: {
        name: 'Medicare Follow-up',
        template: `Hi {firstName}! 👋 Navigating Medicare can be confusing.

I help folks 65+ understand their options:
✅ Medicare Advantage plans
✅ Supplement (Medigap) plans
✅ Part D drug coverage

Free, no-obligation review!
📞 772-208-9646`,
        keywords: ['medicare', '65', 'senior', 'retirement']
    },

    // Lead Nurture
    followUp1: {
        name: 'First Follow-up',
        template: `Hi {firstName}! Just checking in from Flo Faction. Still interested in {topic}? Happy to answer any questions!

📞 772-208-9646
- Paul`,
        timing: '24 hours'
    },

    followUp2: {
        name: 'Second Follow-up',
        template: `Hey {firstName}! 👋 Wanted to reach out one more time about {topic}.

Many of my clients save $500-2000/year with the right coverage.

Worth a quick chat?
📞 772-208-9646`,
        timing: '72 hours'
    },

    followUp3: {
        name: 'Final Follow-up',
        template: `{firstName} - Last message from me!

If you ever need help with insurance or building tax-free wealth, I'm here.

Save my number: 772-208-9646
🌐 flofaction.com

- Paul @ Flo Faction`,
        timing: '7 days'
    },

    // Appointment Reminders
    appointmentReminder: {
        name: 'Appointment Reminder',
        template: `Hi {firstName}! 📅 Just a reminder of your consultation tomorrow at {time}.

Looking forward to discussing {topic}!

If you need to reschedule: 772-208-9646

- Paul @ Flo Faction`,
        timing: '24 hours before'
    },

    // Thank You
    thankYou: {
        name: 'Thank You Message',
        template: `{firstName} - Thanks so much for trusting Flo Faction! 🙏

I'm here for any questions about your {product}.

Referrals are always appreciated!

📞 772-208-9646
- Paul`,
        timing: 'after purchase'
    }
};

// ============================================
// SMS AGENT CLASS
// ============================================
class SMSOutreachAgent extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `sms_outreach_${instanceId}`,
            name: `SMS Outreach Agent #${instanceId}`,
            role: 'outreach',
            team: 'engagement-nurture',
            subTeam: 'sms',
            platforms: ['sms', 'google-voice'],
            capabilities: ['sms-sending', 'template-personalization', 'scheduling', 'response-tracking'],
            priority: 'high'
        });

        this.sentToday = 0;
        this.sentThisHour = 0;
        this.lastHourReset = new Date();
        this.messageLog = [];
    }

    async process(input, context) {
        const { action, recipient, template, data } = input;

        switch (action) {
            case 'send':
                return await this.sendSMS(recipient, template, data);
            case 'batch':
                return await this.batchSend(input.recipients, template, data);
            case 'schedule':
                return await this.scheduleSMS(recipient, template, data, input.sendAt);
            default:
                return { success: false, error: 'Unknown action' };
        }
    }

    async sendSMS(recipient, templateKey, data) {
        // Rate limiting check
        this.checkRateLimits();

        if (this.sentThisHour >= GOOGLE_VOICE_CONFIG.maxSMSPerHour) {
            return { success: false, error: 'Hourly rate limit reached' };
        }
        if (this.sentToday >= GOOGLE_VOICE_CONFIG.maxSMSPerDay) {
            return { success: false, error: 'Daily rate limit reached' };
        }

        // Get template
        const template = SMS_TEMPLATES[templateKey];
        if (!template) {
            return { success: false, error: `Template ${templateKey} not found` };
        }

        // Personalize message
        const message = this.personalizeMessage(template.template, data);

        // Validate message length
        if (message.length > GOOGLE_VOICE_CONFIG.limits.concatenated) {
            return { success: false, error: 'Message exceeds maximum length' };
        }

        // Log the message (actual sending would integrate with Google Voice API)
        const logEntry = {
            id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            recipient,
            template: templateKey,
            message,
            data,
            sentAt: new Date(),
            status: 'queued',
            segments: Math.ceil(message.length / 160)
        };

        this.messageLog.push(logEntry);
        this.sentToday++;
        this.sentThisHour++;

        return {
            success: true,
            messageId: logEntry.id,
            message,
            segments: logEntry.segments,
            recipient
        };
    }

    async batchSend(recipients, templateKey, data) {
        const results = [];

        for (const recipient of recipients) {
            const recipientData = { ...data, ...recipient };
            const result = await this.sendSMS(
                recipient.phone,
                templateKey,
                recipientData
            );
            results.push({ recipient: recipient.phone, ...result });

            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return {
            total: recipients.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    async scheduleSMS(recipient, templateKey, data, sendAt) {
        const scheduledMessage = {
            id: `scheduled_${Date.now()}`,
            recipient,
            template: templateKey,
            data,
            scheduledFor: new Date(sendAt),
            status: 'scheduled',
            createdAt: new Date()
        };

        // In production, store in database for scheduler to process
        return {
            success: true,
            scheduled: true,
            messageId: scheduledMessage.id,
            sendAt: scheduledMessage.scheduledFor
        };
    }

    personalizeMessage(template, data) {
        let message = template;

        // Replace all placeholders
        for (const [key, value] of Object.entries(data || {})) {
            const placeholder = new RegExp(`\\{${key}\\}`, 'gi');
            message = message.replace(placeholder, value || '');
        }

        // Clean up any remaining placeholders
        message = message.replace(/\{[^}]+\}/g, '');

        return message.trim();
    }

    checkRateLimits() {
        const now = new Date();

        // Reset hourly counter
        if (now - this.lastHourReset > 3600000) {
            this.sentThisHour = 0;
            this.lastHourReset = now;
        }

        // Reset daily counter at midnight
        const today = now.toDateString();
        if (this.lastDayReset !== today) {
            this.sentToday = 0;
            this.lastDayReset = today;
        }
    }

    isBusinessHours() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        const { start, end, days } = GOOGLE_VOICE_CONFIG.businessHours;
        return days.includes(day) && hour >= start && hour < end;
    }

    getStatus() {
        return {
            ...super.getStatus(),
            smsStats: {
                sentToday: this.sentToday,
                sentThisHour: this.sentThisHour,
                dailyLimit: GOOGLE_VOICE_CONFIG.maxSMSPerDay,
                hourlyLimit: GOOGLE_VOICE_CONFIG.maxSMSPerHour,
                isBusinessHours: this.isBusinessHours()
            }
        };
    }
}

// ============================================
// SMS RESPONSE HANDLER
// ============================================
class SMSResponseHandler extends FloFactionAgent {
    constructor() {
        super({
            id: 'sms_response_handler',
            name: 'SMS Response Handler',
            role: 'response-handler',
            team: 'engagement-nurture',
            subTeam: 'sms',
            platforms: ['sms', 'google-voice'],
            capabilities: ['response-parsing', 'intent-detection', 'auto-reply', 'escalation'],
            priority: 'high'
        });

        this.autoResponses = {
            'dynasty': {
                reply: `Great choice! The Dynasty Strategy is perfect for building generational wealth.

I'll have a specialist call you within 24 hours to create your custom plan.

In the meantime, check out: flofaction.com/dynasty

- Paul @ Flo Faction`,
                action: 'schedule-callback',
                priority: 'high'
            },
            'waterfall': {
                reply: `Excellent! The Waterfall Method can transform your financial future.

A wealth specialist will call you within 24 hours.

Preview: flofaction.com/waterfall

- Paul @ Flo Faction`,
                action: 'schedule-callback',
                priority: 'high'
            },
            'quote': {
                reply: `I'd love to get you a quote!

To provide accurate pricing, I'll need a few details. What type of insurance are you looking for?

Reply: AUTO, HOME, LIFE, HEALTH, or MEDICARE

- Paul @ Flo Faction`,
                action: 'continue-conversation',
                priority: 'medium'
            },
            'stop': {
                reply: `We've removed you from our messaging list. Sorry to see you go!

If you ever need insurance help: 772-208-9646

- Flo Faction`,
                action: 'unsubscribe',
                priority: 'immediate'
            },
            'help': {
                reply: `Hi! I'm here to help with:

• AUTO insurance
• HOME insurance
• LIFE insurance & wealth building
• HEALTH insurance
• MEDICARE

Reply with what you need, or call: 772-208-9646

- Paul @ Flo Faction`,
                action: 'provide-info',
                priority: 'medium'
            }
        };
    }

    async process(input, context) {
        const { from, message, timestamp } = input;

        // Parse the incoming message
        const analysis = this.analyzeMessage(message);

        // Determine appropriate response
        const response = this.determineResponse(analysis);

        // Log the interaction
        const interaction = {
            id: `response_${Date.now()}`,
            from,
            message,
            analysis,
            response,
            timestamp,
            processedAt: new Date()
        };

        return {
            success: true,
            interaction,
            response: response.reply,
            action: response.action,
            shouldEscalate: response.priority === 'high' || analysis.requiresHuman
        };
    }

    analyzeMessage(message) {
        const text = (message || '').toLowerCase().trim();

        // Check for keywords
        const keywords = {
            dynasty: text.includes('dynasty'),
            waterfall: text.includes('waterfall'),
            quote: text.match(/quote|price|cost|how much/i),
            stop: text.match(/stop|unsubscribe|remove|cancel/i),
            help: text.match(/help|info|question|\?$/i),
            auto: text.match(/auto|car|vehicle/i),
            home: text.match(/home|house|property/i),
            life: text.match(/life|iul|wealth/i),
            health: text.match(/health|medical|aca/i),
            medicare: text.match(/medicare|65|senior/i),
            yes: text.match(/^(yes|yeah|yep|sure|ok|okay)$/i),
            no: text.match(/^(no|nope|nah|not)$/i),
            callback: text.match(/call|callback|phone/i)
        };

        // Determine intent
        let intent = 'unknown';
        let confidence = 0.5;

        if (keywords.stop) {
            intent = 'unsubscribe';
            confidence = 0.95;
        } else if (keywords.dynasty || keywords.waterfall) {
            intent = 'strategy-interest';
            confidence = 0.9;
        } else if (keywords.quote) {
            intent = 'quote-request';
            confidence = 0.85;
        } else if (keywords.help) {
            intent = 'help-request';
            confidence = 0.8;
        } else if (keywords.yes) {
            intent = 'affirmative';
            confidence = 0.9;
        } else if (keywords.no) {
            intent = 'negative';
            confidence = 0.9;
        } else if (keywords.callback) {
            intent = 'callback-request';
            confidence = 0.85;
        }

        // Check if requires human intervention
        const requiresHuman = text.length > 100 ||
            text.match(/complaint|angry|lawyer|cancel policy|refund/i) ||
            intent === 'unknown';

        return {
            originalMessage: message,
            keywords,
            intent,
            confidence,
            requiresHuman,
            productMentioned: this.detectProduct(keywords)
        };
    }

    detectProduct(keywords) {
        if (keywords.auto) return 'auto';
        if (keywords.home) return 'home';
        if (keywords.life) return 'life';
        if (keywords.health) return 'health';
        if (keywords.medicare) return 'medicare';
        return null;
    }

    determineResponse(analysis) {
        // Check for exact keyword matches first
        for (const [keyword, response] of Object.entries(this.autoResponses)) {
            if (analysis.keywords[keyword]) {
                return response;
            }
        }

        // Intent-based responses
        switch (analysis.intent) {
            case 'callback-request':
                return {
                    reply: `Absolutely! A specialist will call you within the next 2 hours during business hours.

Is this the best number to reach you?

- Paul @ Flo Faction`,
                    action: 'schedule-callback',
                    priority: 'high'
                };

            case 'affirmative':
                return {
                    reply: `Great! I'll have someone reach out to you shortly.

If you need immediate assistance: 772-208-9646

- Paul @ Flo Faction`,
                    action: 'schedule-callback',
                    priority: 'medium'
                };

            case 'negative':
                return {
                    reply: `No problem! If you ever need insurance help in the future, we're here.

Save our number: 772-208-9646

- Flo Faction`,
                    action: 'close-conversation',
                    priority: 'low'
                };

            default:
                return {
                    reply: `Thanks for your message! A team member will review and respond shortly.

For faster service, call: 772-208-9646

- Flo Faction`,
                    action: 'escalate-to-human',
                    priority: 'medium'
                };
        }
    }
}

// ============================================
// FACTORY FUNCTION
// ============================================
function createSMSAgentTeam(orchestrator) {
    const agents = [];

    // Create SMS Outreach Agents (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new SMSOutreachAgent(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Create Response Handler
    const responseHandler = new SMSResponseHandler();
    orchestrator.registerAgent(responseHandler);
    agents.push(responseHandler);

    console.log(`✅ SMS Agent Team deployed: ${agents.length} agents`);
    return agents;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    GOOGLE_VOICE_CONFIG,
    SMS_TEMPLATES,
    SMSOutreachAgent,
    SMSResponseHandler,
    createSMSAgentTeam
};
