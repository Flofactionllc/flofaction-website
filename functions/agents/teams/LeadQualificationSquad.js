/**
 * LEAD QUALIFICATION SQUAD - 40 Agents
 * Team 2: Scoring, segmenting, and qualifying leads
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 */

const { FloFactionAgent } = require('../core/HiveMindCore');

// ============================================
// INTENT SCORER AGENTS (5)
// ============================================
class IntentScorer extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `intent_scorer_${instanceId}`,
            name: `Intent Scorer #${instanceId}`,
            role: 'scorer',
            team: 'lead-qualification',
            subTeam: 'scoring',
            capabilities: ['intent-analysis', 'behavioral-scoring', 'engagement-weighting', 'purchase-prediction'],
            priority: 'high'
        });

        this.intentSignals = {
            veryHigh: {
                patterns: [/sign me up/i, /i want to buy/i, /ready to start/i, /take my money/i, /let's do it/i],
                score: 95
            },
            high: {
                patterns: [/interested/i, /tell me more/i, /how much/i, /get a quote/i, /call me/i],
                score: 75
            },
            medium: {
                patterns: [/what is/i, /how does/i, /explain/i, /benefits/i, /\?$/],
                score: 50
            },
            low: {
                patterns: [/maybe/i, /thinking/i, /not sure/i, /later/i],
                score: 25
            }
        };
    }

    async process(input, context) {
        const { message, behaviors, engagementHistory } = input;

        const messageScore = this.scoreMessage(message);
        const behaviorScore = this.scoreBehaviors(behaviors);
        const engagementScore = this.scoreEngagement(engagementHistory);

        const totalScore = Math.round(
            (messageScore * 0.5) + (behaviorScore * 0.3) + (engagementScore * 0.2)
        );

        return {
            leadId: input.leadId,
            scores: {
                message: messageScore,
                behavior: behaviorScore,
                engagement: engagementScore,
                total: totalScore
            },
            intent: this.categorizeIntent(totalScore),
            confidence: this.calculateConfidence(messageScore, behaviorScore),
            recommendation: this.getRecommendation(totalScore)
        };
    }

    scoreMessage(message) {
        const text = message || '';
        for (const [level, config] of Object.entries(this.intentSignals)) {
            for (const pattern of config.patterns) {
                if (pattern.test(text)) {
                    return config.score;
                }
            }
        }
        return 30; // Default base score
    }

    scoreBehaviors(behaviors) {
        if (!behaviors) return 50;
        let score = 50;

        if (behaviors.visitedPricing) score += 20;
        if (behaviors.downloadedGuide) score += 15;
        if (behaviors.watchedVideo) score += 10;
        if (behaviors.multipleVisits) score += 15;
        if (behaviors.filledForm) score += 25;

        return Math.min(score, 100);
    }

    scoreEngagement(history) {
        if (!history || history.length === 0) return 40;

        const recentEngagements = history.filter(e => {
            const daysSince = (Date.now() - new Date(e.timestamp)) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });

        return Math.min(40 + (recentEngagements.length * 10), 100);
    }

    categorizeIntent(score) {
        if (score >= 80) return 'very-high';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    calculateConfidence(msgScore, behScore) {
        const variance = Math.abs(msgScore - behScore);
        if (variance < 10) return 'very-high';
        if (variance < 25) return 'high';
        if (variance < 40) return 'medium';
        return 'low';
    }

    getRecommendation(score) {
        if (score >= 80) return { action: 'immediate-call', priority: 'urgent', agent: 'senior-closer' };
        if (score >= 60) return { action: 'warm-outreach', priority: 'high', agent: 'sales-agent' };
        if (score >= 40) return { action: 'nurture-sequence', priority: 'medium', agent: 'nurture-agent' };
        return { action: 'long-term-nurture', priority: 'low', agent: 'content-agent' };
    }
}

// ============================================
// SEGMENT CLASSIFIER AGENTS (5)
// ============================================
class SegmentClassifier extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `segment_classifier_${instanceId}`,
            name: `Segment Classifier #${instanceId}`,
            role: 'classifier',
            team: 'lead-qualification',
            subTeam: 'segmentation',
            capabilities: ['demographic-analysis', 'psychographic-profiling', 'segment-assignment', 'persona-matching'],
            priority: 'high'
        });

        this.segments = {
            wealthBuilder: {
                indicators: ['iul', 'dynasty', 'waterfall', 'wealth', 'investment', 'retirement'],
                products: ['iul', 'annuities', 'wholeLife'],
                avgValue: 5000,
                priority: 'high'
            },
            familyProtector: {
                indicators: ['family', 'children', 'spouse', 'protect', 'coverage', 'term'],
                products: ['termLife', 'wholeLife', 'health'],
                avgValue: 2500,
                priority: 'high'
            },
            seniorPlanner: {
                indicators: ['65', 'medicare', 'retire', 'senior', 'supplement', 'part d'],
                products: ['medicare', 'finalExpense', 'ltc'],
                avgValue: 3000,
                priority: 'high'
            },
            propertyOwner: {
                indicators: ['home', 'house', 'property', 'auto', 'car', 'vehicle'],
                products: ['auto', 'home', 'umbrella'],
                avgValue: 1500,
                priority: 'medium'
            },
            businessOwner: {
                indicators: ['business', 'company', 'llc', 'owner', 'entrepreneur', 'commercial'],
                products: ['businessInsurance', 'keyMan', 'buyout'],
                avgValue: 7500,
                priority: 'high'
            },
            musicCreator: {
                indicators: ['beat', 'music', 'producer', 'studio', 'track', 'instrumental'],
                products: ['beats', 'production', 'licensing'],
                avgValue: 200,
                priority: 'medium'
            }
        };
    }

    async process(input, context) {
        const { leadData, interactions } = input;

        const matchedSegments = this.identifySegments(leadData, interactions);
        const primarySegment = this.determinePrimarySegment(matchedSegments);
        const persona = this.buildPersona(leadData, primarySegment);

        return {
            leadId: input.leadId,
            segments: matchedSegments,
            primarySegment,
            persona,
            recommendedProducts: this.getRecommendedProducts(matchedSegments),
            estimatedValue: this.calculateEstimatedValue(matchedSegments)
        };
    }

    identifySegments(leadData, interactions) {
        const allText = [
            leadData.message || '',
            leadData.interests || '',
            ...(interactions || []).map(i => i.content || '')
        ].join(' ').toLowerCase();

        const matched = [];
        for (const [segmentName, config] of Object.entries(this.segments)) {
            const matchCount = config.indicators.filter(ind => allText.includes(ind)).length;
            if (matchCount > 0) {
                matched.push({
                    name: segmentName,
                    confidence: Math.min((matchCount / config.indicators.length) * 100, 100),
                    matchedIndicators: config.indicators.filter(ind => allText.includes(ind))
                });
            }
        }

        return matched.sort((a, b) => b.confidence - a.confidence);
    }

    determinePrimarySegment(matchedSegments) {
        if (matchedSegments.length === 0) return { name: 'general', confidence: 50 };
        return matchedSegments[0];
    }

    buildPersona(leadData, primarySegment) {
        const segmentConfig = this.segments[primarySegment.name];
        return {
            type: primarySegment.name,
            characteristics: segmentConfig?.indicators || [],
            likelyNeeds: segmentConfig?.products || [],
            communicationStyle: this.inferCommunicationStyle(leadData),
            urgency: this.inferUrgency(leadData)
        };
    }

    inferCommunicationStyle(leadData) {
        const message = (leadData.message || '').toLowerCase();
        if (message.length > 200) return 'detailed';
        if (message.includes('?')) return 'inquisitive';
        if (message.match(/asap|urgent|quick/)) return 'direct';
        return 'conversational';
    }

    inferUrgency(leadData) {
        const message = (leadData.message || '').toLowerCase();
        if (message.match(/asap|urgent|immediately|today/)) return 'immediate';
        if (message.match(/soon|this week|next week/)) return 'short-term';
        return 'standard';
    }

    getRecommendedProducts(matchedSegments) {
        const products = new Set();
        for (const segment of matchedSegments) {
            const config = this.segments[segment.name];
            if (config) {
                config.products.forEach(p => products.add(p));
            }
        }
        return Array.from(products);
    }

    calculateEstimatedValue(matchedSegments) {
        if (matchedSegments.length === 0) return 1000;
        const values = matchedSegments.map(s => this.segments[s.name]?.avgValue || 1000);
        return Math.max(...values);
    }
}

// ============================================
// BUDGET QUALIFIER AGENTS (5)
// ============================================
class BudgetQualifier extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `budget_qualifier_${instanceId}`,
            name: `Budget Qualifier #${instanceId}`,
            role: 'qualifier',
            team: 'lead-qualification',
            subTeam: 'budget',
            capabilities: ['income-estimation', 'affordability-analysis', 'premium-matching', 'value-optimization'],
            priority: 'medium'
        });

        this.budgetTiers = {
            premium: { minMonthly: 500, products: ['iul', 'wholeLife', 'comprehensiveHealth'] },
            standard: { minMonthly: 200, products: ['termLife', 'auto', 'home', 'health'] },
            basic: { minMonthly: 50, products: ['termLife', 'auto', 'medicare'] },
            starter: { minMonthly: 0, products: ['termLife', 'auto'] }
        };
    }

    async process(input, context) {
        const { leadData, estimatedIncome, existingCoverage } = input;

        const budgetEstimate = this.estimateBudget(leadData, estimatedIncome);
        const tier = this.determineTier(budgetEstimate);
        const affordableProducts = this.getAffordableProducts(tier, existingCoverage);

        return {
            leadId: input.leadId,
            budgetAnalysis: {
                estimatedMonthlyBudget: budgetEstimate,
                tier: tier.name,
                affordableProducts,
                recommendedStartingPoint: affordableProducts[0]
            },
            qualificationStatus: budgetEstimate > 50 ? 'qualified' : 'needs-discussion',
            upsellOpportunities: this.identifyUpsells(tier, existingCoverage)
        };
    }

    estimateBudget(leadData, estimatedIncome) {
        if (estimatedIncome) {
            return Math.round(estimatedIncome * 0.05); // 5% rule of thumb
        }

        const indicators = (leadData.message || '').toLowerCase();
        if (indicators.match(/wealth|invest|dynasty|million/)) return 750;
        if (indicators.match(/business|owner|executive/)) return 500;
        if (indicators.match(/family|home|stable/)) return 250;
        return 100; // Conservative estimate
    }

    determineTier(monthlyBudget) {
        for (const [name, config] of Object.entries(this.budgetTiers)) {
            if (monthlyBudget >= config.minMonthly) {
                return { name, ...config };
            }
        }
        return { name: 'starter', ...this.budgetTiers.starter };
    }

    getAffordableProducts(tier, existingCoverage) {
        const existing = existingCoverage || [];
        return tier.products.filter(p => !existing.includes(p));
    }

    identifyUpsells(tier, existingCoverage) {
        const upsells = [];
        if (tier.name === 'starter' || tier.name === 'basic') {
            upsells.push('Consider bundling auto + home for savings');
        }
        if (!existingCoverage?.includes('iul') && tier.name === 'premium') {
            upsells.push('IUL for tax-advantaged wealth building');
        }
        return upsells;
    }
}

// ============================================
// TIMELINE ASSESSOR AGENTS (5)
// ============================================
class TimelineAssessor extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `timeline_assessor_${instanceId}`,
            name: `Timeline Assessor #${instanceId}`,
            role: 'assessor',
            team: 'lead-qualification',
            subTeam: 'timeline',
            capabilities: ['urgency-detection', 'timeline-estimation', 'deadline-tracking', 'follow-up-scheduling'],
            priority: 'medium'
        });

        this.urgencyIndicators = {
            immediate: ['today', 'now', 'asap', 'urgent', 'emergency', 'immediately'],
            shortTerm: ['this week', 'next week', 'soon', 'quickly', 'few days'],
            mediumTerm: ['this month', 'next month', 'couple weeks', 'thinking about'],
            longTerm: ['eventually', 'someday', 'maybe', 'just looking', 'researching']
        };
    }

    async process(input, context) {
        const { leadData, interactions } = input;

        const timeline = this.assessTimeline(leadData, interactions);
        const followUpSchedule = this.createFollowUpSchedule(timeline);

        return {
            leadId: input.leadId,
            timeline,
            followUpSchedule,
            nextAction: followUpSchedule[0],
            decisionDrivers: this.identifyDecisionDrivers(leadData)
        };
    }

    assessTimeline(leadData, interactions) {
        const allText = [
            leadData.message || '',
            ...(interactions || []).map(i => i.content || '')
        ].join(' ').toLowerCase();

        for (const [timeline, indicators] of Object.entries(this.urgencyIndicators)) {
            if (indicators.some(ind => allText.includes(ind))) {
                return {
                    category: timeline,
                    estimatedDays: this.getEstimatedDays(timeline),
                    confidence: 'high'
                };
            }
        }

        return { category: 'unknown', estimatedDays: 14, confidence: 'low' };
    }

    getEstimatedDays(timeline) {
        const mapping = {
            immediate: 1,
            shortTerm: 7,
            mediumTerm: 30,
            longTerm: 90
        };
        return mapping[timeline] || 14;
    }

    createFollowUpSchedule(timeline) {
        const schedules = {
            immediate: [
                { action: 'call', delay: 0, note: 'Call immediately' },
                { action: 'sms', delay: 2, note: 'Text if no answer' }
            ],
            shortTerm: [
                { action: 'call', delay: 0, note: 'Initial call' },
                { action: 'email', delay: 1, note: 'Follow-up email' },
                { action: 'sms', delay: 3, note: 'Check-in text' }
            ],
            mediumTerm: [
                { action: 'email', delay: 0, note: 'Introduction email' },
                { action: 'call', delay: 3, note: 'Discovery call' },
                { action: 'email', delay: 7, note: 'Value content' },
                { action: 'call', delay: 14, note: 'Follow-up call' }
            ],
            longTerm: [
                { action: 'email', delay: 0, note: 'Introduction' },
                { action: 'email', delay: 7, note: 'Educational content' },
                { action: 'email', delay: 14, note: 'Case study' },
                { action: 'call', delay: 30, note: 'Check-in call' }
            ]
        };

        return schedules[timeline.category] || schedules.mediumTerm;
    }

    identifyDecisionDrivers(leadData) {
        const message = (leadData.message || '').toLowerCase();
        const drivers = [];

        if (message.match(/price|cost|afford|budget/)) drivers.push('price-sensitive');
        if (message.match(/family|kids|spouse/)) drivers.push('family-focused');
        if (message.match(/quick|fast|easy/)) drivers.push('convenience-driven');
        if (message.match(/best|quality|comprehensive/)) drivers.push('quality-focused');
        if (message.match(/recommend|review|trust/)) drivers.push('trust-building');

        return drivers.length > 0 ? drivers : ['general-information'];
    }
}

// ============================================
// PAIN POINT ANALYZER AGENTS (5)
// ============================================
class PainPointAnalyzer extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `pain_point_analyzer_${instanceId}`,
            name: `Pain Point Analyzer #${instanceId}`,
            role: 'analyzer',
            team: 'lead-qualification',
            subTeam: 'pain-points',
            capabilities: ['problem-identification', 'emotion-detection', 'solution-mapping', 'objection-prediction'],
            priority: 'high'
        });

        this.painPoints = {
            overpaying: {
                indicators: ['too expensive', 'paying too much', 'cheaper', 'save money', 'high premium'],
                solution: 'Shop for better rates, bundle discounts',
                urgency: 'high'
            },
            underinsured: {
                indicators: ['not enough coverage', 'worried', 'gaps', 'what if', 'protect'],
                solution: 'Coverage review and upgrade options',
                urgency: 'high'
            },
            confused: {
                indicators: ['confusing', 'don\'t understand', 'complicated', 'explain', 'how does'],
                solution: 'Educational approach, simplify options',
                urgency: 'medium'
            },
            noInsurance: {
                indicators: ['no insurance', 'uninsured', 'never had', 'first time', 'need coverage'],
                solution: 'Starter policy, gradual building',
                urgency: 'high'
            },
            lifeChange: {
                indicators: ['married', 'baby', 'new home', 'new car', 'retired', 'moving'],
                solution: 'Life event coverage review',
                urgency: 'high'
            },
            wealthConcerns: {
                indicators: ['taxes', 'retirement', 'savings', 'legacy', 'inheritance', 'wealth'],
                solution: 'IUL, Dynasty/Waterfall strategies',
                urgency: 'medium'
            }
        };
    }

    async process(input, context) {
        const { leadData, interactions } = input;

        const identifiedPainPoints = this.identifyPainPoints(leadData, interactions);
        const emotionalState = this.detectEmotionalState(leadData);
        const solutions = this.mapSolutions(identifiedPainPoints);

        return {
            leadId: input.leadId,
            painPoints: identifiedPainPoints,
            emotionalState,
            solutions,
            predictedObjections: this.predictObjections(identifiedPainPoints),
            talkingPoints: this.generateTalkingPoints(identifiedPainPoints, emotionalState)
        };
    }

    identifyPainPoints(leadData, interactions) {
        const allText = [
            leadData.message || '',
            ...(interactions || []).map(i => i.content || '')
        ].join(' ').toLowerCase();

        const identified = [];
        for (const [name, config] of Object.entries(this.painPoints)) {
            const matches = config.indicators.filter(ind => allText.includes(ind));
            if (matches.length > 0) {
                identified.push({
                    name,
                    matchedIndicators: matches,
                    urgency: config.urgency,
                    suggestedSolution: config.solution
                });
            }
        }

        return identified.sort((a, b) => (b.urgency === 'high' ? 1 : 0) - (a.urgency === 'high' ? 1 : 0));
    }

    detectEmotionalState(leadData) {
        const message = (leadData.message || '').toLowerCase();

        if (message.match(/worried|scared|anxious|nervous|afraid/)) return 'anxious';
        if (message.match(/frustrated|annoyed|angry|upset/)) return 'frustrated';
        if (message.match(/excited|eager|ready|can't wait/)) return 'excited';
        if (message.match(/curious|wondering|interested/)) return 'curious';
        return 'neutral';
    }

    mapSolutions(painPoints) {
        return painPoints.map(pp => ({
            painPoint: pp.name,
            solution: pp.suggestedSolution,
            products: this.getRelevantProducts(pp.name)
        }));
    }

    getRelevantProducts(painPoint) {
        const productMapping = {
            overpaying: ['auto', 'home', 'bundled'],
            underinsured: ['life', 'umbrella', 'comprehensive'],
            confused: ['consultationCall', 'educationalMaterials'],
            noInsurance: ['termLife', 'auto', 'health'],
            lifeChange: ['life', 'home', 'health'],
            wealthConcerns: ['iul', 'annuities', 'wholeLife']
        };
        return productMapping[painPoint] || ['consultation'];
    }

    predictObjections(painPoints) {
        const objections = [];
        for (const pp of painPoints) {
            if (pp.name === 'overpaying') {
                objections.push('Will be price-focused, may need value justification');
            }
            if (pp.name === 'confused') {
                objections.push('May need extra time, avoid jargon');
            }
        }
        return objections;
    }

    generateTalkingPoints(painPoints, emotionalState) {
        const points = [];

        if (emotionalState === 'anxious') {
            points.push('Emphasize security and protection');
            points.push('Use reassuring language');
        }
        if (emotionalState === 'frustrated') {
            points.push('Acknowledge their frustration');
            points.push('Focus on solutions, not problems');
        }

        for (const pp of painPoints.slice(0, 2)) {
            points.push(`Address ${pp.name}: ${pp.suggestedSolution}`);
        }

        return points;
    }
}

// ============================================
// INTEREST LEVEL EVALUATOR AGENTS (5)
// ============================================
class InterestLevelEvaluator extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `interest_evaluator_${instanceId}`,
            name: `Interest Level Evaluator #${instanceId}`,
            role: 'evaluator',
            team: 'lead-qualification',
            subTeam: 'interest',
            capabilities: ['interest-scoring', 'engagement-analysis', 'dropout-prediction', 'conversion-likelihood'],
            priority: 'medium'
        });
    }

    async process(input, context) {
        const { leadData, interactions, behaviors } = input;

        const interestLevel = this.evaluateInterest(leadData, interactions, behaviors);
        const conversionLikelihood = this.predictConversion(interestLevel, behaviors);
        const dropoutRisk = this.assessDropoutRisk(interactions);

        return {
            leadId: input.leadId,
            interestLevel,
            conversionLikelihood,
            dropoutRisk,
            engagement: this.categorizeEngagement(interactions),
            recommendations: this.getRecommendations(interestLevel, dropoutRisk)
        };
    }

    evaluateInterest(leadData, interactions, behaviors) {
        let score = 50; // Base score

        // Message analysis
        const message = (leadData.message || '').toLowerCase();
        if (message.match(/very interested|definitely|absolutely/)) score += 30;
        if (message.match(/interested|want to know/)) score += 20;
        if (message.match(/maybe|possibly|might/)) score -= 10;

        // Interaction frequency
        const recentInteractions = (interactions || []).filter(i => {
            const daysSince = (Date.now() - new Date(i.timestamp)) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });
        score += Math.min(recentInteractions.length * 5, 25);

        // Behavioral signals
        if (behaviors?.returnVisits > 1) score += 15;
        if (behaviors?.timeOnSite > 300) score += 10;
        if (behaviors?.pagesViewed > 3) score += 10;

        return {
            score: Math.min(Math.max(score, 0), 100),
            level: score >= 75 ? 'very-high' : score >= 55 ? 'high' : score >= 35 ? 'medium' : 'low'
        };
    }

    predictConversion(interestLevel, behaviors) {
        let probability = interestLevel.score / 100;

        if (behaviors?.filledForm) probability += 0.15;
        if (behaviors?.requestedCallback) probability += 0.20;
        if (behaviors?.downloadedContent) probability += 0.10;

        return {
            probability: Math.min(probability, 0.95),
            percentage: Math.round(Math.min(probability, 0.95) * 100) + '%',
            confidence: probability > 0.6 ? 'high' : probability > 0.4 ? 'medium' : 'low'
        };
    }

    assessDropoutRisk(interactions) {
        if (!interactions || interactions.length === 0) {
            return { risk: 'high', reason: 'No engagement yet' };
        }

        const lastInteraction = interactions[interactions.length - 1];
        const daysSinceLastContact = (Date.now() - new Date(lastInteraction.timestamp)) / (1000 * 60 * 60 * 24);

        if (daysSinceLastContact > 14) return { risk: 'very-high', reason: 'No contact in 14+ days' };
        if (daysSinceLastContact > 7) return { risk: 'high', reason: 'No contact in 7+ days' };
        if (daysSinceLastContact > 3) return { risk: 'medium', reason: 'Cooling off' };
        return { risk: 'low', reason: 'Recently engaged' };
    }

    categorizeEngagement(interactions) {
        const count = (interactions || []).length;
        if (count >= 5) return 'highly-engaged';
        if (count >= 3) return 'engaged';
        if (count >= 1) return 'initial-contact';
        return 'no-engagement';
    }

    getRecommendations(interestLevel, dropoutRisk) {
        const recommendations = [];

        if (interestLevel.level === 'very-high') {
            recommendations.push('Schedule immediate call - hot lead');
        }
        if (dropoutRisk.risk === 'high' || dropoutRisk.risk === 'very-high') {
            recommendations.push('Re-engagement campaign needed');
        }
        if (interestLevel.level === 'medium') {
            recommendations.push('Send valuable content to build interest');
        }

        return recommendations;
    }
}

// ============================================
// AUTHORITY ASSESSOR AGENTS (3)
// ============================================
class AuthorityAssessor extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `authority_assessor_${instanceId}`,
            name: `Authority Assessor #${instanceId}`,
            role: 'assessor',
            team: 'lead-qualification',
            subTeam: 'authority',
            capabilities: ['decision-maker-identification', 'stakeholder-mapping', 'influence-analysis'],
            priority: 'medium'
        });
    }

    async process(input, context) {
        const { leadData, companyInfo } = input;

        const authorityLevel = this.assessAuthority(leadData, companyInfo);
        const stakeholders = this.identifyStakeholders(leadData);

        return {
            leadId: input.leadId,
            authorityLevel,
            stakeholders,
            decisionProcess: this.mapDecisionProcess(authorityLevel, stakeholders),
            strategy: this.recommendStrategy(authorityLevel)
        };
    }

    assessAuthority(leadData, companyInfo) {
        const title = (leadData.title || '').toLowerCase();

        if (title.match(/owner|ceo|president|founder|principal/)) {
            return { level: 'decision-maker', confidence: 'high' };
        }
        if (title.match(/director|vp|vice president|manager|head/)) {
            return { level: 'influencer', confidence: 'medium' };
        }
        if (title.match(/assistant|coordinator|specialist/)) {
            return { level: 'researcher', confidence: 'medium' };
        }

        // For personal insurance
        if (leadData.type === 'personal') {
            return { level: 'decision-maker', confidence: 'high' };
        }

        return { level: 'unknown', confidence: 'low' };
    }

    identifyStakeholders(leadData) {
        const stakeholders = [{ role: 'primary-contact', info: leadData }];

        const message = (leadData.message || '').toLowerCase();
        if (message.match(/spouse|partner|wife|husband/)) {
            stakeholders.push({ role: 'spouse', info: null });
        }
        if (message.match(/family|we|our/)) {
            stakeholders.push({ role: 'family-members', info: null });
        }

        return stakeholders;
    }

    mapDecisionProcess(authorityLevel, stakeholders) {
        if (stakeholders.length === 1 && authorityLevel.level === 'decision-maker') {
            return { type: 'individual', steps: ['present', 'close'] };
        }
        if (stakeholders.length > 1) {
            return { type: 'household', steps: ['present', 'discuss-with-spouse', 'follow-up', 'close'] };
        }
        return { type: 'standard', steps: ['qualify', 'present', 'follow-up', 'close'] };
    }

    recommendStrategy(authorityLevel) {
        if (authorityLevel.level === 'decision-maker') {
            return 'Direct approach, focus on value and close';
        }
        if (authorityLevel.level === 'influencer') {
            return 'Provide information to share with decision-maker';
        }
        return 'Qualify further to identify decision-maker';
    }
}

// ============================================
// FIT SCORE CALCULATOR AGENTS (2)
// ============================================
class FitScoreCalculator extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `fit_score_calculator_${instanceId}`,
            name: `Fit Score Calculator #${instanceId}`,
            role: 'calculator',
            team: 'lead-qualification',
            subTeam: 'fit-scoring',
            capabilities: ['ideal-customer-matching', 'fit-analysis', 'opportunity-sizing', 'priority-ranking'],
            priority: 'high'
        });

        this.idealCustomerProfile = {
            demographics: { minAge: 25, maxAge: 70, hasFamily: true },
            financial: { minIncome: 50000, hasAssets: true },
            behavioral: { responds: true, engaged: true },
            needs: { hasInsuranceNeed: true, openToAdvice: true }
        };
    }

    async process(input, context) {
        const { leadData, qualificationData } = input;

        const fitScore = this.calculateFitScore(leadData, qualificationData);
        const ranking = this.determineRanking(fitScore);
        const gaps = this.identifyGaps(leadData, qualificationData);

        return {
            leadId: input.leadId,
            fitScore,
            ranking,
            gaps,
            recommendedAction: this.getRecommendedAction(fitScore, gaps),
            potentialValue: this.estimatePotentialValue(fitScore, qualificationData)
        };
    }

    calculateFitScore(leadData, qualificationData) {
        let score = 0;
        let maxScore = 0;

        // Demographic fit (25 points)
        maxScore += 25;
        if (leadData.age >= 25 && leadData.age <= 70) score += 15;
        if (leadData.hasFamily) score += 10;

        // Financial fit (25 points)
        maxScore += 25;
        if (qualificationData?.budgetTier === 'premium') score += 25;
        else if (qualificationData?.budgetTier === 'standard') score += 15;
        else score += 5;

        // Behavioral fit (25 points)
        maxScore += 25;
        if (qualificationData?.interestLevel?.level === 'very-high') score += 25;
        else if (qualificationData?.interestLevel?.level === 'high') score += 15;
        else score += 5;

        // Needs fit (25 points)
        maxScore += 25;
        if (qualificationData?.painPoints?.length > 0) score += 15;
        if (qualificationData?.timeline?.category === 'immediate') score += 10;

        return {
            score: Math.round((score / maxScore) * 100),
            breakdown: { demographic: 25, financial: 25, behavioral: 25, needs: 25 }
        };
    }

    determineRanking(fitScore) {
        if (fitScore.score >= 80) return 'A';
        if (fitScore.score >= 60) return 'B';
        if (fitScore.score >= 40) return 'C';
        return 'D';
    }

    identifyGaps(leadData, qualificationData) {
        const gaps = [];
        if (!leadData.phone) gaps.push('Missing phone number');
        if (!leadData.email) gaps.push('Missing email');
        if (!qualificationData?.budgetTier) gaps.push('Budget not qualified');
        if (!qualificationData?.timeline) gaps.push('Timeline unknown');
        return gaps;
    }

    getRecommendedAction(fitScore, gaps) {
        if (fitScore.score >= 80 && gaps.length === 0) {
            return { action: 'fast-track', priority: 1, note: 'Ideal customer - prioritize' };
        }
        if (fitScore.score >= 60) {
            return { action: 'standard-follow-up', priority: 2, note: 'Good fit - proceed normally' };
        }
        if (gaps.length > 0) {
            return { action: 'gather-info', priority: 3, note: `Fill gaps: ${gaps.join(', ')}` };
        }
        return { action: 'nurture', priority: 4, note: 'Long-term nurture campaign' };
    }

    estimatePotentialValue(fitScore, qualificationData) {
        const baseValue = qualificationData?.estimatedValue || 1000;
        const multiplier = fitScore.score / 100;
        return Math.round(baseValue * (1 + multiplier));
    }
}

// ============================================
// FACTORY FUNCTION
// ============================================
function createLeadQualificationSquad(orchestrator) {
    const agents = [];

    // Intent Scorers (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new IntentScorer(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Segment Classifiers (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new SegmentClassifier(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Budget Qualifiers (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new BudgetQualifier(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Timeline Assessors (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new TimelineAssessor(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Pain Point Analyzers (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new PainPointAnalyzer(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Interest Level Evaluators (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new InterestLevelEvaluator(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Authority Assessors (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new AuthorityAssessor(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Fit Score Calculators (2)
    for (let i = 1; i <= 2; i++) {
        const agent = new FitScoreCalculator(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    console.log(`✅ Lead Qualification Squad deployed: ${agents.length} agents`);
    return agents;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    IntentScorer,
    SegmentClassifier,
    BudgetQualifier,
    TimelineAssessor,
    PainPointAnalyzer,
    InterestLevelEvaluator,
    AuthorityAssessor,
    FitScoreCalculator,
    createLeadQualificationSquad
};
