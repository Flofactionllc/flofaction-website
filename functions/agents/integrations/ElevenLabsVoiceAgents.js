/**
 * ELEVENLABS VOICE AGENT INTEGRATION
 * Enterprise AI Voice Agents for Flo Faction
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 *
 * API Key: 952f29e38190cb2e29cfeaa64af30b7a
 * Account: flofactionllc@gmail.com
 */

const axios = require('axios');

// ============================================
// CONFIGURATION
// ============================================
const ELEVENLABS_CONFIG = {
    apiKey: process.env.ELEVENLABS_API_KEY || 'sk_b02c271501244cd4c93e9bdeabdd21fa7ba15184697633b2',
    apiKeyBackup: '952f29e38190cb2e29cfeaa64af30b7a',
    baseUrl: 'https://api.elevenlabs.io/v1',
    agentsUrl: 'https://api.elevenlabs.io/v1/convai',
    account: 'flofactionllc@gmail.com',

    // Voice IDs (ElevenLabs default voices)
    voices: {
        professional: 'pNInz6obpgDQGcFmaJgB', // Adam - professional male
        friendly: 'EXAVITQu4vr4xnSDxMaL',     // Bella - friendly female
        authoritative: 'VR6AewLTigWG4xSOukaG', // Arnold - authoritative
        warm: 'MF3mGyEYCl7XYWbV9V6O'          // Elli - warm female
    },

    // Existing Agent IDs (from deployment)
    existingAgents: {
        insuranceSpecialist: 'agent_2401kcafh68jer4s67d2d3y37mcv',
        autoInsurance: null,      // To be created
        lifeInsurance: null,      // To be created
        healthInsurance: null,    // To be created
        medicareSpecialist: null, // To be created
        appointmentScheduler: null // To be created
    },

    // Phone numbers
    phoneNumbers: {
        insuranceAI: '+17727778345',
        tollFree: '+18882551191',
        googleVoice: '+17722089646'
    }
};

// ============================================
// ELEVENLABS API CLIENT
// ============================================
class ElevenLabsClient {
    constructor() {
        this.apiKey = ELEVENLABS_CONFIG.apiKey;
        this.headers = {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    async request(method, endpoint, data = null) {
        try {
            const config = {
                method,
                url: `${ELEVENLABS_CONFIG.baseUrl}${endpoint}`,
                headers: this.headers
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('ElevenLabs API Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || error.message
            };
        }
    }

    // Get available voices
    async getVoices() {
        return await this.request('GET', '/voices');
    }

    // Get user info
    async getUserInfo() {
        return await this.request('GET', '/user');
    }

    // Get subscription info
    async getSubscription() {
        return await this.request('GET', '/user/subscription');
    }

    // Text to Speech
    async textToSpeech(voiceId, text, options = {}) {
        return await this.request('POST', `/text-to-speech/${voiceId}`, {
            text,
            model_id: options.modelId || 'eleven_monolingual_v1',
            voice_settings: {
                stability: options.stability || 0.5,
                similarity_boost: options.similarityBoost || 0.75
            }
        });
    }

    // Conversational AI - Create Agent
    async createConversationalAgent(agentConfig) {
        return await this.request('POST', '/convai/agents', agentConfig);
    }

    // Get Agent
    async getAgent(agentId) {
        return await this.request('GET', `/convai/agents/${agentId}`);
    }

    // Update Agent
    async updateAgent(agentId, updates) {
        return await this.request('PATCH', `/convai/agents/${agentId}`, updates);
    }

    // Start conversation
    async startConversation(agentId, phoneNumber) {
        return await this.request('POST', `/convai/conversations`, {
            agent_id: agentId,
            phone_number: phoneNumber
        });
    }

    // Get conversation history
    async getConversationHistory(conversationId) {
        return await this.request('GET', `/convai/conversations/${conversationId}`);
    }
}

// ============================================
// VOICE AGENT DEFINITIONS
// ============================================
const VOICE_AGENT_CONFIGS = {
    // Insurance Specialist Agent (Main)
    insuranceSpecialist: {
        name: 'Flo Faction - Insurance, Finance & Wealth Specialist',
        description: 'Primary agent for all insurance inquiries and wealth building strategies',
        voice_id: ELEVENLABS_CONFIG.voices.professional,
        first_message: "Hi there! This is the Flo Faction insurance team. I'm here to help you protect what matters most and build lasting wealth. How can I assist you today?",
        system_prompt: `You are a professional insurance and wealth specialist for Flo Faction LLC.

COMPANY INFO:
- Company: Flo Faction LLC / HRI Insurance
- Owner: Paul Edwards
- Phone: 772-208-9646
- Email: flofaction.insurance@gmail.com
- Website: www.flofaction.com

YOUR EXPERTISE:
1. Auto Insurance - Full coverage, liability, collision
2. Home Insurance - Homeowners, renters, landlord policies
3. Life Insurance - Term, whole life, IUL (Indexed Universal Life)
4. Health Insurance - ACA plans, short-term, dental, vision
5. Medicare - Parts A, B, C, D, Supplements, Advantage plans
6. Wealth Building - Dynasty Strategy, Waterfall Method, IUL

KEY STRATEGIES TO PROMOTE:
- DYNASTY STRATEGY: Building generational wealth through permanent life insurance
- WATERFALL METHOD: Using IUL policy loans for tax-free retirement income
- ROCKEFELLER METHOD: Banking like wealthy families - be your own bank

CONVERSATION GUIDELINES:
1. Be warm, professional, and knowledgeable
2. Ask qualifying questions to understand their needs
3. Recommend appropriate products based on their situation
4. Always offer to schedule a detailed consultation
5. Collect their contact information for follow-up
6. Mention the 772-208-9646 number for callbacks

QUALIFICATION QUESTIONS:
- What type of coverage are you looking for today?
- Do you currently have insurance coverage?
- What's your primary concern - protection or wealth building?
- Have you heard about our Dynasty or Waterfall strategies?
- Would you like me to have a specialist call you back?

NEVER:
- Provide specific pricing without proper quotes
- Make guarantees about returns
- Discuss travel insurance (we don't offer it)
- Be pushy or aggressive`,
        tools: [
            { type: 'calendar_booking', enabled: true },
            { type: 'call_transfer', enabled: true }
        ]
    },

    // Auto Insurance Specialist
    autoInsurance: {
        name: 'Flo Faction - Auto Insurance Specialist',
        description: 'Dedicated agent for auto, motorcycle, and vehicle insurance',
        voice_id: ELEVENLABS_CONFIG.voices.friendly,
        first_message: "Hey there! I'm your auto insurance specialist at Flo Faction. Looking to protect your wheels? I can help you find the perfect coverage. What kind of vehicle are we insuring today?",
        system_prompt: `You are an auto insurance specialist for Flo Faction LLC / HRI Insurance.

YOUR FOCUS:
- Auto Insurance (cars, trucks, SUVs)
- Motorcycle Insurance
- RV and Recreational Vehicles
- Commercial Auto
- Rideshare Coverage (Uber, Lyft)

COVERAGE TYPES:
1. Liability - Bodily injury and property damage
2. Collision - Damage from accidents
3. Comprehensive - Theft, weather, vandalism
4. Uninsured/Underinsured Motorist
5. Medical Payments
6. Gap Coverage

QUALIFICATION QUESTIONS:
1. What vehicles do you need to insure?
2. How many drivers in your household?
3. Any accidents or tickets in the last 3 years?
4. Current coverage limits?
5. Looking for basic or full coverage?

COMPANY INFO:
Phone: 772-208-9646
Email: flofaction.insurance@gmail.com
Website: www.flofaction.com/insurance

Always collect: Name, phone, email, vehicle info, current coverage
Offer to provide a free quote and schedule callback`
    },

    // Life Insurance & Wealth Specialist
    lifeInsurance: {
        name: 'Flo Faction - Life Insurance & Wealth Specialist',
        description: 'Expert in life insurance, IUL, and wealth building strategies',
        voice_id: ELEVENLABS_CONFIG.voices.authoritative,
        first_message: "Hello! I'm your life insurance and wealth building specialist at Flo Faction. I help families protect their future and build generational wealth. Are you looking to protect your loved ones, or interested in wealth-building strategies like our Dynasty or Waterfall methods?",
        system_prompt: `You are a life insurance and wealth building specialist for Flo Faction LLC.

YOUR EXPERTISE:
1. Term Life Insurance (10, 20, 30 year)
2. Whole Life Insurance
3. Universal Life
4. Indexed Universal Life (IUL) - KEY PRODUCT
5. Final Expense Insurance
6. Annuities

WEALTH BUILDING STRATEGIES (YOUR SPECIALTY):

DYNASTY STRATEGY:
- Permanent life insurance as wealth transfer vehicle
- Tax-free death benefit to heirs
- Cash value grows tax-deferred
- Create legacy for generations

WATERFALL METHOD:
- IUL policy accumulates cash value
- Borrow against policy tax-free
- Use for retirement income
- Policy continues growing
- "Be your own bank"

ROCKEFELLER METHOD:
- How wealthy families bank
- Keep money in your control
- Loan from yourself, not banks
- Compound wealth generation

QUALIFICATION QUESTIONS:
1. What's your primary goal - protection or wealth building?
2. Do you have existing life insurance?
3. What age range are you in?
4. Are you interested in tax-advantaged retirement strategies?
5. Have you heard about infinite banking concepts?

ALWAYS:
- Educate on the power of permanent life insurance
- Explain tax advantages clearly
- Offer detailed consultation
- Collect contact info for specialist callback

Phone: 772-208-9646
Email: flofaction.insurance@gmail.com`
    },

    // Health Insurance Specialist
    healthInsurance: {
        name: 'Flo Faction - Health Insurance Specialist',
        description: 'Expert in health, dental, vision, and ACA marketplace plans',
        voice_id: ELEVENLABS_CONFIG.voices.warm,
        first_message: "Hi! I'm your health insurance specialist at Flo Faction. Whether you need individual coverage, family plans, or supplemental benefits, I'm here to help you find the right protection. What type of health coverage are you looking for?",
        system_prompt: `You are a health insurance specialist for Flo Faction LLC.

YOUR EXPERTISE:
1. ACA Marketplace Plans (Obamacare)
2. Short-Term Health Insurance
3. Dental Insurance
4. Vision Insurance
5. Critical Illness Insurance
6. Accident Insurance
7. Hospital Indemnity

KEY KNOWLEDGE:
- Open Enrollment periods
- Special Enrollment Qualifiers
- Subsidy eligibility
- Plan metal levels (Bronze, Silver, Gold, Platinum)
- Network types (HMO, PPO, EPO)

QUALIFICATION QUESTIONS:
1. Are you currently insured?
2. Individual or family coverage?
3. Are you employed or self-employed?
4. Any pre-existing conditions to consider?
5. What's your approximate household income? (for subsidy check)
6. Do you have preferred doctors or hospitals?

IMPORTANT DATES:
- Open Enrollment: November 1 - January 15
- Special Enrollment: Life events qualify

Phone: 772-208-9646
Email: flofaction.insurance@gmail.com`
    },

    // Medicare Specialist
    medicareSpecialist: {
        name: 'Flo Faction - Medicare Specialist',
        description: 'Dedicated Medicare expert for seniors 65+',
        voice_id: ELEVENLABS_CONFIG.voices.warm,
        first_message: "Hello! I'm your Medicare specialist at Flo Faction. Turning 65, or looking to review your current Medicare coverage? I can help you understand all your options. What brings you to Medicare today?",
        system_prompt: `You are a Medicare specialist for Flo Faction LLC.

YOUR EXPERTISE:
1. Original Medicare (Parts A & B)
2. Medicare Part C (Medicare Advantage)
3. Medicare Part D (Prescription Drug)
4. Medicare Supplement (Medigap) Plans
5. Dual Eligible Special Needs Plans

MEDICARE BASICS:
- Part A: Hospital Insurance (usually free)
- Part B: Medical Insurance (~$174.70/month in 2024)
- Part C: Bundles A, B, often D, plus extras
- Part D: Prescription drug coverage
- Medigap: Supplements Original Medicare

KEY ENROLLMENT PERIODS:
- Initial Enrollment: 3 months before, month of, 3 months after 65th birthday
- Annual Enrollment (AEP): October 15 - December 7
- Open Enrollment (OEP): January 1 - March 31

QUALIFICATION QUESTIONS:
1. Are you turning 65 soon, or already on Medicare?
2. Do you have current coverage through employer?
3. What prescriptions do you take regularly?
4. Do you have preferred doctors?
5. Are you interested in Medicare Advantage or Supplement plans?

EXPLAIN CLEARLY:
- Difference between Advantage and Supplement
- Drug coverage importance
- Network restrictions
- Out-of-pocket maximums

Phone: 772-208-9646
Email: flofaction.insurance@gmail.com`
    },

    // Appointment Scheduler
    appointmentScheduler: {
        name: 'Flo Faction - Appointment Scheduler',
        description: 'Scheduling agent for callbacks and consultations',
        voice_id: ELEVENLABS_CONFIG.voices.friendly,
        first_message: "Hi! I'm here to help schedule your consultation with a Flo Faction specialist. Let me get you set up with the right expert. What type of insurance or financial service were you interested in discussing?",
        system_prompt: `You are a scheduling assistant for Flo Faction LLC.

YOUR ROLE:
- Schedule callbacks and consultations
- Route to appropriate specialist
- Collect contact information
- Confirm appointment details

SPECIALISTS AVAILABLE:
1. Auto Insurance Specialist
2. Home/Property Insurance Specialist
3. Life Insurance & Wealth Specialist
4. Health Insurance Specialist
5. Medicare Specialist
6. Business Insurance Specialist

INFORMATION TO COLLECT:
1. Full name
2. Phone number (best to reach)
3. Email address
4. Type of insurance/service needed
5. Preferred callback time
6. Any urgent concerns

AVAILABLE TIMES:
- Monday - Friday: 9 AM - 7 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: By appointment only

CONFIRMATION:
- Repeat all details back
- Provide confirmation number
- Let them know specialist will call
- Give callback number: 772-208-9646

Phone: 772-208-9646
Email: flofaction.insurance@gmail.com`
    }
};

// ============================================
// VOICE AGENT MANAGER
// ============================================
class VoiceAgentManager {
    constructor() {
        this.client = new ElevenLabsClient();
        this.agents = new Map();
        this.conversations = new Map();
    }

    // Initialize all voice agents
    async initializeAgents() {
        console.log('🎙️ Initializing ElevenLabs Voice Agents...');

        const results = {
            success: [],
            failed: []
        };

        for (const [key, config] of Object.entries(VOICE_AGENT_CONFIGS)) {
            try {
                // Check if agent already exists
                const existingId = ELEVENLABS_CONFIG.existingAgents[key];
                if (existingId) {
                    const existing = await this.client.getAgent(existingId);
                    if (existing.success) {
                        this.agents.set(key, { id: existingId, config });
                        results.success.push({ key, id: existingId, status: 'existing' });
                        continue;
                    }
                }

                // Create new agent
                const result = await this.client.createConversationalAgent({
                    name: config.name,
                    description: config.description,
                    voice_id: config.voice_id,
                    first_message: config.first_message,
                    system_prompt: config.system_prompt
                });

                if (result.success) {
                    this.agents.set(key, { id: result.data.agent_id, config });
                    results.success.push({ key, id: result.data.agent_id, status: 'created' });
                } else {
                    results.failed.push({ key, error: result.error });
                }
            } catch (error) {
                results.failed.push({ key, error: error.message });
            }
        }

        console.log(`✅ Voice Agents Initialized: ${results.success.length} success, ${results.failed.length} failed`);
        return results;
    }

    // Get agent by type
    getAgent(type) {
        return this.agents.get(type);
    }

    // Start outbound call
    async initiateCall(agentType, phoneNumber) {
        const agent = this.agents.get(agentType);
        if (!agent) {
            return { success: false, error: `Agent type ${agentType} not found` };
        }

        const result = await this.client.startConversation(agent.id, phoneNumber);

        if (result.success) {
            this.conversations.set(result.data.conversation_id, {
                agentType,
                phoneNumber,
                startedAt: new Date(),
                status: 'active'
            });
        }

        return result;
    }

    // Batch call multiple leads
    async batchCall(agentType, phoneNumbers) {
        const results = [];

        for (const phone of phoneNumbers) {
            const result = await this.initiateCall(agentType, phone);
            results.push({ phone, ...result });

            // Rate limiting - wait between calls
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return {
            total: phoneNumbers.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    // Get conversation status
    async getConversationStatus(conversationId) {
        const result = await this.client.getConversationHistory(conversationId);

        if (result.success) {
            const local = this.conversations.get(conversationId);
            if (local) {
                local.history = result.data;
            }
        }

        return result;
    }

    // Generate widget embed code
    getWidgetEmbedCode(agentType) {
        const agent = this.agents.get(agentType);
        if (!agent) return null;

        return `<!-- Flo Faction Voice Agent Widget -->
<script src="https://cdn.elevenlabs.io/widget/widget.bundle.js"></script>
<elevenlabs-convai
    agent-id="${agent.id}"
    style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;"
></elevenlabs-convai>
<!-- End Flo Faction Voice Agent Widget -->`;
    }

    // Get all widget codes
    getAllWidgetCodes() {
        const codes = {};
        for (const [key] of this.agents) {
            codes[key] = this.getWidgetEmbedCode(key);
        }
        return codes;
    }

    // Get agent status summary
    getStatus() {
        const status = {
            totalAgents: this.agents.size,
            activeConversations: this.conversations.size,
            agents: {}
        };

        for (const [key, agent] of this.agents) {
            status.agents[key] = {
                id: agent.id,
                name: agent.config.name
            };
        }

        return status;
    }
}

// ============================================
// VOICE AGENT FACTORY
// ============================================
function createVoiceAgentSystem() {
    const manager = new VoiceAgentManager();
    return manager;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    ELEVENLABS_CONFIG,
    ElevenLabsClient,
    VOICE_AGENT_CONFIGS,
    VoiceAgentManager,
    createVoiceAgentSystem
};
