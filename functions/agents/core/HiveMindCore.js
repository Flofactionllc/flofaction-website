/**
 * FLO FACTION HIVE MIND CORE
 * Enterprise AI Agent Orchestration System
 *
 * @version 2.0.0
 * @author Flo Faction LLC
 * @date January 2026
 */

const admin = require('firebase-admin');

// ============================================
// CONFIGURATION
// ============================================
const HIVE_CONFIG = {
    version: '2.0.0',
    totalAgents: 220,
    teams: 6,
    sharedMemoryEnabled: true,
    learningEnabled: true,
    analyticsEnabled: true,
    realTimeSync: true,

    // Business Configuration
    business: {
        name: 'Flo Faction LLC',
        owner: 'Paul Edwards',
        phone: '772-208-9646',
        emails: {
            insurance: 'flofaction.insurance@gmail.com',
            business: 'flofaction.business@gmail.com',
            hri: 'paul@hriinsurance.com',
            main: 'flofactionllc@gmail.com'
        },
        website: 'https://www.flofaction.com',
        socialMedia: {
            tiktok: '@flofaction.insurance',
            instagram: '@flofaction',
            facebook: 'flofaction',
            youtube: 'flofaction'
        }
    },

    // Service Divisions (NO TRAVEL)
    divisions: [
        'HRI Insurance (Property & Casualty)',
        'Flo Faction Insurance (Life, Health, Medicare)',
        'Wealth Management (IUL, Annuities)',
        'AI & Automation Services',
        'Digital Marketing',
        'Music & Beat Store (CryptK, Luap, Luapiano)'
    ],

    // Products & Services
    products: {
        insurance: {
            auto: { active: true, priority: 'high' },
            home: { active: true, priority: 'high' },
            life: { active: true, priority: 'high' },
            health: { active: true, priority: 'high' },
            medicare: { active: true, priority: 'high' },
            iul: { active: true, priority: 'high' },
            annuities: { active: true, priority: 'medium' },
            disability: { active: true, priority: 'medium' },
            ltc: { active: true, priority: 'medium' },
            finalExpense: { active: true, priority: 'medium' }
        },
        digital: {
            webDevelopment: { active: true, priority: 'high' },
            aiAutomation: { active: true, priority: 'high' },
            marketing: { active: true, priority: 'medium' },
            seo: { active: true, priority: 'medium' }
        },
        music: {
            cryptkBeats: { active: true, priority: 'medium' },
            luapBeats: { active: true, priority: 'medium' },
            luapianoBeats: { active: true, priority: 'medium' },
            customProduction: { active: true, priority: 'low' }
        }
    },

    // Key Strategies
    strategies: {
        dynasty: {
            name: 'Dynasty Strategy',
            description: 'Generational wealth through permanent life insurance',
            keywords: ['dynasty', 'generational', 'wealth transfer', 'legacy']
        },
        waterfall: {
            name: 'Waterfall Strategy',
            description: 'Infinite banking through IUL policy loans',
            keywords: ['waterfall', 'infinite banking', 'iul', 'tax-free loans']
        },
        rockefeller: {
            name: 'Rockefeller Method',
            description: 'Banking like the wealthy families',
            keywords: ['rockefeller', 'banking secrets', 'be your own bank']
        }
    }
};

// ============================================
// BASE AGENT CLASS
// ============================================
class FloFactionAgent {
    constructor(config) {
        this.id = config.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name;
        this.role = config.role;
        this.team = config.team;
        this.subTeam = config.subTeam || null;
        this.capabilities = config.capabilities || [];
        this.platforms = config.platforms || [];
        this.priority = config.priority || 'medium';
        this.isActive = true;
        this.learningEnabled = config.learningEnabled !== false;

        this.state = {
            created: new Date(),
            lastActive: null,
            interactions: 0,
            successRate: 100,
            errors: 0,
            learnings: []
        };

        this.context = {
            currentTask: null,
            pendingTasks: [],
            completedTasks: []
        };

        this.knowledge = {
            local: {},
            shared: null // Reference to hive shared knowledge
        };
    }

    // Core execution method
    async execute(input, context = {}) {
        this.state.lastActive = new Date();
        this.state.interactions++;
        this.context.currentTask = input;

        try {
            const result = await this.process(input, context);
            this.context.completedTasks.push({
                input,
                result,
                timestamp: new Date(),
                success: true
            });
            return { success: true, agentId: this.id, data: result };
        } catch (error) {
            this.state.errors++;
            this.state.successRate = ((this.state.interactions - this.state.errors) / this.state.interactions) * 100;
            return { success: false, agentId: this.id, error: error.message };
        } finally {
            this.context.currentTask = null;
        }
    }

    // Override in subclasses
    async process(input, context) {
        throw new Error(`Agent ${this.name}: process() must be implemented`);
    }

    // Learning from interactions
    learn(lesson) {
        if (this.learningEnabled) {
            this.state.learnings.push({
                lesson,
                timestamp: new Date(),
                applied: false
            });
        }
    }

    // Handoff to another agent
    async handoff(targetAgentId, data, orchestrator) {
        return await orchestrator.routeToAgent(targetAgentId, {
            ...data,
            handoffFrom: this.id,
            handoffTimestamp: new Date()
        });
    }

    // Get agent status
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            team: this.team,
            isActive: this.isActive,
            stats: {
                interactions: this.state.interactions,
                successRate: this.state.successRate.toFixed(2) + '%',
                errors: this.state.errors,
                lastActive: this.state.lastActive
            }
        };
    }

    // Serialize for persistence
    serialize() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            role: this.role,
            team: this.team,
            state: this.state,
            knowledge: this.knowledge.local
        });
    }
}

// ============================================
// HIVE MIND ORCHESTRATOR
// ============================================
class HiveMindOrchestrator {
    constructor() {
        this.agents = new Map();
        this.teams = new Map();
        this.sharedKnowledge = {
            products: HIVE_CONFIG.products,
            strategies: HIVE_CONFIG.strategies,
            business: HIVE_CONFIG.business,
            leads: [],
            interactions: [],
            patterns: {},
            insights: []
        };
        this.messageQueue = [];
        this.eventLog = [];
        this.isInitialized = false;
    }

    // Initialize the hive mind
    async initialize() {
        if (this.isInitialized) return;

        console.log('🐝 Initializing Flo Faction Hive Mind...');
        console.log(`📊 Target: ${HIVE_CONFIG.totalAgents} agents across ${HIVE_CONFIG.teams} teams`);

        // Initialize team containers
        const teamNames = [
            'prospect-acquisition',
            'lead-qualification',
            'engagement-nurture',
            'content-creation',
            'customer-success',
            'operations'
        ];

        teamNames.forEach(team => this.teams.set(team, []));

        this.isInitialized = true;
        this.logEvent('hive-initialized', { timestamp: new Date() });

        return { success: true, teams: teamNames.length };
    }

    // Register an agent to the hive
    registerAgent(agent) {
        // Connect agent to shared knowledge
        agent.knowledge.shared = this.sharedKnowledge;

        // Add to agents map
        this.agents.set(agent.id, agent);

        // Add to team
        if (!this.teams.has(agent.team)) {
            this.teams.set(agent.team, []);
        }
        this.teams.get(agent.team).push(agent.id);

        this.logEvent('agent-registered', {
            agentId: agent.id,
            name: agent.name,
            team: agent.team
        });

        return agent.id;
    }

    // Route request to best agent
    async routeRequest(request) {
        const intent = this.analyzeIntent(request);
        const team = this.selectTeam(intent);
        const agent = this.selectBestAgent(team, intent);

        if (!agent) {
            return { success: false, error: 'No available agent for this request' };
        }

        return await agent.execute(request, { intent, orchestrator: this });
    }

    // Route directly to specific agent
    async routeToAgent(agentId, data) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return { success: false, error: `Agent ${agentId} not found` };
        }
        return await agent.execute(data, { orchestrator: this });
    }

    // Analyze request intent
    analyzeIntent(request) {
        const text = (request.message || request.query || '').toLowerCase();

        // Check for strategy keywords
        for (const [key, strategy] of Object.entries(HIVE_CONFIG.strategies)) {
            if (strategy.keywords.some(kw => text.includes(kw))) {
                return { type: 'strategy', strategy: key, confidence: 0.9 };
            }
        }

        // Check for product keywords
        if (text.match(/auto|car|vehicle/)) return { type: 'product', product: 'auto', confidence: 0.85 };
        if (text.match(/home|house|property/)) return { type: 'product', product: 'home', confidence: 0.85 };
        if (text.match(/life|iul|permanent/)) return { type: 'product', product: 'life', confidence: 0.85 };
        if (text.match(/health|medical|aca/)) return { type: 'product', product: 'health', confidence: 0.85 };
        if (text.match(/medicare|65|senior/)) return { type: 'product', product: 'medicare', confidence: 0.85 };
        if (text.match(/beat|music|producer|instrumental/)) return { type: 'product', product: 'music', confidence: 0.8 };

        // Check for action keywords
        if (text.match(/quote|price|cost|how much/)) return { type: 'action', action: 'quote', confidence: 0.8 };
        if (text.match(/help|support|question/)) return { type: 'action', action: 'support', confidence: 0.75 };
        if (text.match(/buy|purchase|sign up/)) return { type: 'action', action: 'purchase', confidence: 0.85 };

        return { type: 'general', confidence: 0.5 };
    }

    // Select appropriate team
    selectTeam(intent) {
        if (intent.type === 'strategy' || intent.action === 'quote') {
            return 'lead-qualification';
        }
        if (intent.action === 'support') {
            return 'customer-success';
        }
        if (intent.action === 'purchase') {
            return 'engagement-nurture';
        }
        return 'prospect-acquisition';
    }

    // Select best available agent from team
    selectBestAgent(teamName, intent) {
        const teamAgentIds = this.teams.get(teamName) || [];
        if (teamAgentIds.length === 0) return null;

        // Get all agents and sort by success rate and availability
        const agents = teamAgentIds
            .map(id => this.agents.get(id))
            .filter(a => a && a.isActive)
            .sort((a, b) => {
                // Prioritize by success rate, then by least busy
                const rateA = a.state.successRate;
                const rateB = b.state.successRate;
                if (rateA !== rateB) return rateB - rateA;
                return (a.context.currentTask ? 1 : 0) - (b.context.currentTask ? 1 : 0);
            });

        return agents[0] || null;
    }

    // Update shared knowledge
    updateSharedKnowledge(category, key, data) {
        if (!this.sharedKnowledge[category]) {
            this.sharedKnowledge[category] = {};
        }
        this.sharedKnowledge[category][key] = {
            data,
            updatedAt: new Date(),
            updatedBy: 'hive'
        };

        this.logEvent('knowledge-updated', { category, key });
    }

    // Add lead to shared knowledge
    addLead(leadData) {
        const lead = {
            ...leadData,
            id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            createdAt: new Date(),
            status: 'new',
            score: 0,
            interactions: []
        };

        this.sharedKnowledge.leads.push(lead);
        this.logEvent('lead-added', { leadId: lead.id });

        return lead;
    }

    // Log interaction for learning
    logInteraction(interaction) {
        this.sharedKnowledge.interactions.push({
            ...interaction,
            timestamp: new Date()
        });

        // Limit to last 10000 interactions
        if (this.sharedKnowledge.interactions.length > 10000) {
            this.sharedKnowledge.interactions = this.sharedKnowledge.interactions.slice(-10000);
        }
    }

    // Log hive event
    logEvent(eventType, data) {
        this.eventLog.push({
            type: eventType,
            data,
            timestamp: new Date()
        });
    }

    // Get hive status
    getStatus() {
        const teamStats = {};
        this.teams.forEach((agentIds, teamName) => {
            const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean);
            teamStats[teamName] = {
                total: agents.length,
                active: agents.filter(a => a.isActive).length,
                avgSuccessRate: agents.length > 0
                    ? (agents.reduce((sum, a) => sum + a.state.successRate, 0) / agents.length).toFixed(2) + '%'
                    : '0%'
            };
        });

        return {
            initialized: this.isInitialized,
            totalAgents: this.agents.size,
            teams: teamStats,
            sharedKnowledge: {
                leads: this.sharedKnowledge.leads.length,
                interactions: this.sharedKnowledge.interactions.length
            },
            eventLogSize: this.eventLog.length
        };
    }

    // Broadcast message to all agents in a team
    async broadcastToTeam(teamName, message) {
        const agentIds = this.teams.get(teamName) || [];
        const results = await Promise.all(
            agentIds.map(id => {
                const agent = this.agents.get(id);
                return agent ? agent.execute({ type: 'broadcast', message }) : null;
            })
        );
        return results.filter(Boolean);
    }

    // Get all agents of a specific role
    getAgentsByRole(role) {
        return Array.from(this.agents.values()).filter(a => a.role === role);
    }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    HIVE_CONFIG,
    FloFactionAgent,
    HiveMindOrchestrator
};
