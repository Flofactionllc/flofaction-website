/**
 * FLO FACTION AGENT MEMORY SYSTEM
 * Persistent memory and learning for autonomous AI agents
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 */

// ============================================
// MEMORY TYPES
// ============================================
const MEMORY_TYPES = {
    SHORT_TERM: 'short_term',      // Current conversation context
    LONG_TERM: 'long_term',        // Persistent knowledge about clients
    EPISODIC: 'episodic',          // Specific interaction memories
    SEMANTIC: 'semantic',          // General knowledge and facts
    PROCEDURAL: 'procedural'       // How to do things
};

// ============================================
// MEMORY STORE CLASS
// ============================================
class MemoryStore {
    constructor() {
        this.shortTermMemory = new Map();
        this.longTermMemory = new Map();
        this.episodicMemory = [];
        this.semanticMemory = new Map();
        this.proceduralMemory = new Map();
        this.clientProfiles = new Map();
        this.interactionHistory = [];
        this.learnings = [];
        this.patterns = new Map();
    }

    // ============================================
    // CLIENT MEMORY
    // ============================================

    // Remember a client
    rememberClient(clientId, data) {
        const existing = this.clientProfiles.get(clientId) || {
            id: clientId,
            createdAt: new Date(),
            interactions: [],
            preferences: {},
            needs: [],
            objections: [],
            products: [],
            notes: []
        };

        const updated = {
            ...existing,
            ...data,
            lastUpdated: new Date(),
            interactions: [...existing.interactions, ...(data.interactions || [])]
        };

        this.clientProfiles.set(clientId, updated);
        return updated;
    }

    // Recall client information
    recallClient(clientId) {
        return this.clientProfiles.get(clientId) || null;
    }

    // Search clients by criteria
    searchClients(criteria) {
        const results = [];
        for (const [id, profile] of this.clientProfiles) {
            let matches = true;
            for (const [key, value] of Object.entries(criteria)) {
                if (profile[key] !== value) {
                    matches = false;
                    break;
                }
            }
            if (matches) results.push(profile);
        }
        return results;
    }

    // ============================================
    // CONVERSATION MEMORY
    // ============================================

    // Store conversation context
    storeConversation(sessionId, messages) {
        this.shortTermMemory.set(sessionId, {
            messages,
            startedAt: new Date(),
            lastActivity: new Date()
        });
    }

    // Get conversation context
    getConversation(sessionId) {
        return this.shortTermMemory.get(sessionId) || null;
    }

    // Add message to conversation
    addToConversation(sessionId, message) {
        const conversation = this.shortTermMemory.get(sessionId) || {
            messages: [],
            startedAt: new Date()
        };

        conversation.messages.push({
            ...message,
            timestamp: new Date()
        });
        conversation.lastActivity = new Date();

        this.shortTermMemory.set(sessionId, conversation);
        return conversation;
    }

    // Extract key information from conversation
    extractKeyInfo(conversation) {
        const info = {
            clientName: null,
            email: null,
            phone: null,
            interests: [],
            objections: [],
            intent: null,
            urgency: null
        };

        for (const msg of conversation.messages || []) {
            const text = (msg.content || msg.text || '').toLowerCase();

            // Extract name patterns
            const nameMatch = text.match(/(?:my name is|i'm|i am)\s+(\w+)/i);
            if (nameMatch) info.clientName = nameMatch[1];

            // Extract email
            const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
            if (emailMatch) info.email = emailMatch[0];

            // Extract phone
            const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
            if (phoneMatch) info.phone = phoneMatch[0];

            // Detect interests
            if (text.includes('auto') || text.includes('car')) info.interests.push('auto-insurance');
            if (text.includes('home') || text.includes('house')) info.interests.push('home-insurance');
            if (text.includes('life')) info.interests.push('life-insurance');
            if (text.includes('health')) info.interests.push('health-insurance');
            if (text.includes('medicare')) info.interests.push('medicare');
            if (text.includes('dynasty') || text.includes('wealth')) info.interests.push('wealth-building');
            if (text.includes('waterfall') || text.includes('iul')) info.interests.push('iul');
            if (text.includes('beat') || text.includes('music')) info.interests.push('music');

            // Detect objections
            if (text.includes('expensive') || text.includes('cost')) info.objections.push('price');
            if (text.includes('think about')) info.objections.push('time');
            if (text.includes('spouse') || text.includes('partner')) info.objections.push('decision-maker');

            // Detect urgency
            if (text.includes('asap') || text.includes('urgent') || text.includes('today')) {
                info.urgency = 'high';
            } else if (text.includes('soon') || text.includes('this week')) {
                info.urgency = 'medium';
            }
        }

        return info;
    }

    // ============================================
    // EPISODIC MEMORY (Specific Events)
    // ============================================

    // Record an episode/event
    recordEpisode(episode) {
        const entry = {
            id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...episode,
            recordedAt: new Date()
        };
        this.episodicMemory.push(entry);

        // Limit to last 10000 episodes
        if (this.episodicMemory.length > 10000) {
            this.episodicMemory = this.episodicMemory.slice(-10000);
        }

        return entry;
    }

    // Recall episodes by criteria
    recallEpisodes(criteria, limit = 10) {
        let filtered = this.episodicMemory;

        if (criteria.clientId) {
            filtered = filtered.filter(e => e.clientId === criteria.clientId);
        }
        if (criteria.type) {
            filtered = filtered.filter(e => e.type === criteria.type);
        }
        if (criteria.after) {
            filtered = filtered.filter(e => new Date(e.recordedAt) > new Date(criteria.after));
        }
        if (criteria.before) {
            filtered = filtered.filter(e => new Date(e.recordedAt) < new Date(criteria.before));
        }

        return filtered.slice(-limit);
    }

    // ============================================
    // SEMANTIC MEMORY (Facts & Knowledge)
    // ============================================

    // Store a fact
    storeFact(category, key, value) {
        if (!this.semanticMemory.has(category)) {
            this.semanticMemory.set(category, new Map());
        }
        this.semanticMemory.get(category).set(key, {
            value,
            storedAt: new Date(),
            accessCount: 0
        });
    }

    // Recall a fact
    recallFact(category, key) {
        const categoryMem = this.semanticMemory.get(category);
        if (!categoryMem) return null;

        const fact = categoryMem.get(key);
        if (fact) {
            fact.accessCount++;
            fact.lastAccessed = new Date();
        }
        return fact?.value || null;
    }

    // Get all facts in category
    getAllFacts(category) {
        const categoryMem = this.semanticMemory.get(category);
        if (!categoryMem) return {};

        const facts = {};
        for (const [key, data] of categoryMem) {
            facts[key] = data.value;
        }
        return facts;
    }

    // ============================================
    // PROCEDURAL MEMORY (How-To Knowledge)
    // ============================================

    // Store a procedure
    storeProcedure(name, steps) {
        this.proceduralMemory.set(name, {
            steps,
            storedAt: new Date(),
            usageCount: 0,
            successRate: 100
        });
    }

    // Recall a procedure
    recallProcedure(name) {
        const procedure = this.proceduralMemory.get(name);
        if (procedure) {
            procedure.usageCount++;
            procedure.lastUsed = new Date();
        }
        return procedure?.steps || null;
    }

    // Update procedure success rate
    updateProcedureSuccess(name, wasSuccessful) {
        const procedure = this.proceduralMemory.get(name);
        if (procedure) {
            const total = procedure.usageCount;
            const currentSuccesses = (procedure.successRate / 100) * (total - 1);
            const newSuccesses = currentSuccesses + (wasSuccessful ? 1 : 0);
            procedure.successRate = (newSuccesses / total) * 100;
        }
    }

    // ============================================
    // PATTERN RECOGNITION & LEARNING
    // ============================================

    // Record a pattern
    recordPattern(patternType, data) {
        const patterns = this.patterns.get(patternType) || [];
        patterns.push({
            data,
            recordedAt: new Date()
        });
        this.patterns.set(patternType, patterns);

        // Analyze for insights
        this.analyzePatterns(patternType);
    }

    // Analyze patterns for insights
    analyzePatterns(patternType) {
        const patterns = this.patterns.get(patternType) || [];
        if (patterns.length < 10) return; // Need enough data

        const insights = {
            type: patternType,
            sampleSize: patterns.length,
            analyzedAt: new Date(),
            findings: []
        };

        // Frequency analysis
        const frequencies = {};
        for (const p of patterns) {
            const key = JSON.stringify(p.data);
            frequencies[key] = (frequencies[key] || 0) + 1;
        }

        // Find most common patterns
        const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            insights.findings.push({
                type: 'most_common',
                pattern: JSON.parse(sorted[0][0]),
                frequency: sorted[0][1]
            });
        }

        this.storeLearning({
            type: 'pattern_insight',
            patternType,
            insights
        });
    }

    // Store a learning
    storeLearning(learning) {
        this.learnings.push({
            ...learning,
            learnedAt: new Date()
        });
    }

    // Get relevant learnings
    getLearnings(type = null) {
        if (type) {
            return this.learnings.filter(l => l.type === type);
        }
        return this.learnings;
    }

    // ============================================
    // CONTEXT BUILDING
    // ============================================

    // Build full context for an interaction
    buildContext(sessionId, clientId = null) {
        const context = {
            conversation: this.getConversation(sessionId),
            client: clientId ? this.recallClient(clientId) : null,
            recentEpisodes: this.recallEpisodes({ clientId }, 5),
            relevantFacts: {},
            suggestedProcedures: [],
            learnings: this.getLearnings().slice(-10)
        };

        // Add extracted info from conversation
        if (context.conversation) {
            context.extractedInfo = this.extractKeyInfo(context.conversation);
        }

        // Suggest relevant procedures based on context
        if (context.extractedInfo?.interests?.length > 0) {
            for (const interest of context.extractedInfo.interests) {
                const procedure = this.recallProcedure(`sell_${interest}`);
                if (procedure) {
                    context.suggestedProcedures.push({
                        name: `sell_${interest}`,
                        steps: procedure
                    });
                }
            }
        }

        return context;
    }

    // ============================================
    // PERSISTENCE (Firebase Integration Ready)
    // ============================================

    // Export all memory for persistence
    exportMemory() {
        return {
            clientProfiles: Object.fromEntries(this.clientProfiles),
            episodicMemory: this.episodicMemory,
            semanticMemory: this.serializeMap(this.semanticMemory),
            proceduralMemory: Object.fromEntries(this.proceduralMemory),
            learnings: this.learnings,
            patterns: this.serializeMap(this.patterns),
            exportedAt: new Date()
        };
    }

    // Import memory from persistence
    importMemory(data) {
        if (data.clientProfiles) {
            this.clientProfiles = new Map(Object.entries(data.clientProfiles));
        }
        if (data.episodicMemory) {
            this.episodicMemory = data.episodicMemory;
        }
        if (data.semanticMemory) {
            this.semanticMemory = this.deserializeMap(data.semanticMemory);
        }
        if (data.proceduralMemory) {
            this.proceduralMemory = new Map(Object.entries(data.proceduralMemory));
        }
        if (data.learnings) {
            this.learnings = data.learnings;
        }
        if (data.patterns) {
            this.patterns = this.deserializeMap(data.patterns);
        }
    }

    // Helper to serialize nested maps
    serializeMap(map) {
        const obj = {};
        for (const [key, value] of map) {
            if (value instanceof Map) {
                obj[key] = this.serializeMap(value);
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    // Helper to deserialize nested maps
    deserializeMap(obj) {
        const map = new Map();
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                map.set(key, this.deserializeMap(value));
            } else {
                map.set(key, value);
            }
        }
        return map;
    }

    // Get memory statistics
    getStats() {
        return {
            clients: this.clientProfiles.size,
            conversations: this.shortTermMemory.size,
            episodes: this.episodicMemory.length,
            facts: this.countSemanticFacts(),
            procedures: this.proceduralMemory.size,
            learnings: this.learnings.length,
            patterns: this.patterns.size
        };
    }

    countSemanticFacts() {
        let count = 0;
        for (const [, categoryMap] of this.semanticMemory) {
            count += categoryMap.size;
        }
        return count;
    }
}

// ============================================
// GLOBAL MEMORY INSTANCE
// ============================================
const globalMemory = new MemoryStore();

// Pre-populate with procedural knowledge
globalMemory.storeProcedure('sell_auto-insurance', [
    'Greet and build rapport',
    'Ask about current coverage',
    'Identify pain points (price, service, coverage gaps)',
    'Gather vehicle and driver information',
    'Present competitive options',
    'Highlight unique benefits',
    'Handle objections',
    'Close with urgency (rates can change)',
    'Schedule follow-up if needed'
]);

globalMemory.storeProcedure('sell_life-insurance', [
    'Build trust and rapport',
    'Ask about family and dependents',
    'Understand their goals (protection vs wealth building)',
    'Calculate coverage needs',
    'Present appropriate products (term, whole, IUL)',
    'Explain benefits clearly',
    'Address concerns about cost',
    'Use emotional connection (protecting family)',
    'Close with importance of acting now',
    'Offer medical exam scheduling'
]);

globalMemory.storeProcedure('sell_wealth-building', [
    'Establish credibility',
    'Understand current financial situation',
    'Identify wealth goals',
    'Educate on Dynasty/Waterfall/Rockefeller strategies',
    'Show real examples and projections',
    'Compare to traditional investments',
    'Address tax advantages',
    'Handle objections about complexity',
    'Close with long-term vision',
    'Schedule detailed planning session'
]);

globalMemory.storeProcedure('handle_objection_price', [
    'Acknowledge their concern',
    'Ask what budget they have in mind',
    'Reframe as investment, not cost',
    'Show value vs price comparison',
    'Offer alternative options within budget',
    'Highlight cost of NOT having coverage',
    'Close with affordable starting point'
]);

globalMemory.storeProcedure('book_appointment', [
    'Express enthusiasm',
    'Offer multiple time options',
    'Confirm their contact information',
    'Explain what to expect',
    'Send confirmation immediately',
    'Set reminder for follow-up'
]);

// ============================================
// EXPORTS
// ============================================
module.exports = {
    MEMORY_TYPES,
    MemoryStore,
    globalMemory
};
