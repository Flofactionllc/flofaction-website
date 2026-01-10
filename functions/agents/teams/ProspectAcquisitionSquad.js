/**
 * PROSPECT ACQUISITION SQUAD - 35 Agents
 * Team 1: Lead harvesting from all channels
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 */

const { FloFactionAgent } = require('../core/HiveMindCore');

// ============================================
// TIKTOK LEAD HARVESTER AGENTS (5)
// ============================================
class TikTokLeadHarvester extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `tiktok_harvester_${instanceId}`,
            name: `TikTok Lead Harvester #${instanceId}`,
            role: 'lead-harvester',
            team: 'prospect-acquisition',
            subTeam: 'tiktok',
            platforms: ['tiktok'],
            capabilities: ['comment-scraping', 'engagement-analysis', 'profile-extraction', 'keyword-detection'],
            priority: 'high'
        });

        this.targetVideos = [
            'banking-secrets',
            'rockefeller-method',
            'waterfall-strategy',
            'dynasty-wealth',
            'iul-explained'
        ];

        this.targetKeywords = [
            'dynasty', 'waterfall', 'banking', 'wealth', 'iul',
            'life insurance', 'tax free', 'generational', 'rockefeller',
            'interested', 'how', 'tell me more', 'sign me up'
        ];
    }

    async process(input, context) {
        const { videoId, comments } = input;

        // Analyze comments for prospects
        const prospects = [];
        for (const comment of comments || []) {
            const analysis = this.analyzeComment(comment);
            if (analysis.isProspect) {
                prospects.push({
                    platform: 'tiktok',
                    handle: comment.author,
                    videoId,
                    comment: comment.text,
                    sentiment: analysis.sentiment,
                    intent: analysis.intent,
                    keywords: analysis.keywords,
                    score: analysis.score,
                    extractedAt: new Date()
                });
            }
        }

        // Learn from patterns
        if (prospects.length > 0) {
            this.learn({
                pattern: 'high-intent-keywords',
                data: prospects.map(p => p.keywords).flat()
            });
        }

        return {
            videoId,
            prospectsFound: prospects.length,
            prospects,
            recommendations: this.generateRecommendations(prospects)
        };
    }

    analyzeComment(comment) {
        const text = (comment.text || '').toLowerCase();
        const matchedKeywords = this.targetKeywords.filter(kw => text.includes(kw));

        let score = 0;
        let intent = 'passive';

        // High-intent signals
        if (text.match(/sign me up|interested|tell me more|how do i|contact/i)) {
            score += 40;
            intent = 'high';
        }
        if (text.match(/dynasty|waterfall|rockefeller/i)) {
            score += 30;
            intent = intent === 'high' ? 'very-high' : 'high';
        }
        if (matchedKeywords.length >= 2) {
            score += 20;
        }
        if (text.match(/\?/)) {
            score += 10; // Questions indicate interest
        }

        return {
            isProspect: score >= 20,
            score: Math.min(score, 100),
            sentiment: this.analyzeSentiment(text),
            intent,
            keywords: matchedKeywords
        };
    }

    analyzeSentiment(text) {
        const positive = ['love', 'great', 'amazing', 'thanks', 'helpful', 'yes', 'interested'];
        const negative = ['scam', 'fake', 'no', 'bad', 'wrong'];

        const posCount = positive.filter(w => text.includes(w)).length;
        const negCount = negative.filter(w => text.includes(w)).length;

        if (posCount > negCount) return 'positive';
        if (negCount > posCount) return 'negative';
        return 'neutral';
    }

    generateRecommendations(prospects) {
        const highIntent = prospects.filter(p => p.intent === 'very-high' || p.intent === 'high');
        return {
            priorityOutreach: highIntent.map(p => ({
                handle: p.handle,
                suggestedTemplate: p.keywords.includes('waterfall') ? 'WATERFALL' : 'DYNASTY',
                urgency: p.intent === 'very-high' ? 'immediate' : 'today'
            })),
            totalHighIntent: highIntent.length
        };
    }
}

// ============================================
// INSTAGRAM LEAD HARVESTER AGENTS (5)
// ============================================
class InstagramLeadHarvester extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `instagram_harvester_${instanceId}`,
            name: `Instagram Lead Harvester #${instanceId}`,
            role: 'lead-harvester',
            team: 'prospect-acquisition',
            subTeam: 'instagram',
            platforms: ['instagram'],
            capabilities: ['comment-scraping', 'story-engagement', 'dm-monitoring', 'hashtag-tracking'],
            priority: 'high'
        });

        this.targetHashtags = [
            '#wealthbuilding', '#financialfreedom', '#lifeinsurance',
            '#generationalwealth', '#infinitebanking', '#iul',
            '#insuranceagent', '#retirementplanning', '#taxfree'
        ];
    }

    async process(input, context) {
        const { postId, comments, likes, stories } = input;

        const prospects = [];

        // Process comments
        for (const comment of comments || []) {
            const analysis = this.analyzeEngagement(comment, 'comment');
            if (analysis.qualifies) {
                prospects.push({
                    platform: 'instagram',
                    handle: comment.author,
                    postId,
                    engagementType: 'comment',
                    content: comment.text,
                    analysis,
                    extractedAt: new Date()
                });
            }
        }

        // Process story replies
        for (const story of stories || []) {
            if (story.replies) {
                for (const reply of story.replies) {
                    const analysis = this.analyzeEngagement(reply, 'story-reply');
                    if (analysis.qualifies) {
                        prospects.push({
                            platform: 'instagram',
                            handle: reply.author,
                            storyId: story.id,
                            engagementType: 'story-reply',
                            content: reply.text,
                            analysis,
                            extractedAt: new Date()
                        });
                    }
                }
            }
        }

        return {
            postId,
            prospectsFound: prospects.length,
            prospects,
            engagementStats: this.calculateEngagementStats(comments, likes)
        };
    }

    analyzeEngagement(engagement, type) {
        const text = (engagement.text || '').toLowerCase();
        let score = 0;

        // Base score by engagement type
        if (type === 'story-reply') score += 15; // Stories indicate higher intent
        if (type === 'comment') score += 10;

        // Intent keywords
        if (text.match(/dm|message|info|learn|interested|how/i)) score += 30;
        if (text.match(/dynasty|waterfall|banking|wealth/i)) score += 25;
        if (text.match(/\?/)) score += 10;

        return {
            qualifies: score >= 25,
            score,
            intent: score >= 50 ? 'high' : score >= 30 ? 'medium' : 'low'
        };
    }

    calculateEngagementStats(comments, likes) {
        return {
            commentCount: (comments || []).length,
            likeCount: likes || 0,
            engagementRate: likes ? ((comments || []).length / likes * 100).toFixed(2) + '%' : '0%'
        };
    }
}

// ============================================
// FACEBOOK LEAD HARVESTER AGENTS (3)
// ============================================
class FacebookLeadHarvester extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `facebook_harvester_${instanceId}`,
            name: `Facebook Lead Harvester #${instanceId}`,
            role: 'lead-harvester',
            team: 'prospect-acquisition',
            subTeam: 'facebook',
            platforms: ['facebook'],
            capabilities: ['group-monitoring', 'page-engagement', 'messenger-leads', 'ad-response-tracking'],
            priority: 'medium'
        });
    }

    async process(input, context) {
        const { source, engagements } = input;

        const prospects = [];
        for (const engagement of engagements || []) {
            if (this.qualifiesAsLead(engagement)) {
                prospects.push({
                    platform: 'facebook',
                    source,
                    userId: engagement.userId,
                    name: engagement.name,
                    engagementType: engagement.type,
                    content: engagement.content,
                    extractedAt: new Date()
                });
            }
        }

        return { source, prospectsFound: prospects.length, prospects };
    }

    qualifiesAsLead(engagement) {
        const text = (engagement.content || '').toLowerCase();
        return text.match(/interested|info|quote|help|insurance|wealth/i) !== null;
    }
}

// ============================================
// LINKEDIN PROSPECT AGENTS (3)
// ============================================
class LinkedInProspectAgent extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `linkedin_prospect_${instanceId}`,
            name: `LinkedIn Prospect Agent #${instanceId}`,
            role: 'lead-harvester',
            team: 'prospect-acquisition',
            subTeam: 'linkedin',
            platforms: ['linkedin'],
            capabilities: ['connection-analysis', 'post-engagement', 'inmail-tracking', 'company-research'],
            priority: 'medium'
        });

        this.targetTitles = [
            'business owner', 'entrepreneur', 'ceo', 'founder',
            'executive', 'director', 'manager', 'professional'
        ];
    }

    async process(input, context) {
        const { connections, postEngagements } = input;

        const prospects = [];

        // Analyze post engagements
        for (const engagement of postEngagements || []) {
            if (this.isQualifiedProspect(engagement)) {
                prospects.push({
                    platform: 'linkedin',
                    profileUrl: engagement.profileUrl,
                    name: engagement.name,
                    title: engagement.title,
                    company: engagement.company,
                    engagementType: engagement.type,
                    qualificationScore: this.scoreProspect(engagement),
                    extractedAt: new Date()
                });
            }
        }

        return { prospectsFound: prospects.length, prospects };
    }

    isQualifiedProspect(engagement) {
        const title = (engagement.title || '').toLowerCase();
        return this.targetTitles.some(t => title.includes(t));
    }

    scoreProspect(engagement) {
        let score = 50; // Base score
        const title = (engagement.title || '').toLowerCase();

        if (title.includes('ceo') || title.includes('founder') || title.includes('owner')) score += 30;
        if (title.includes('director') || title.includes('executive')) score += 20;
        if (engagement.type === 'comment') score += 15;
        if (engagement.type === 'share') score += 20;

        return Math.min(score, 100);
    }
}

// ============================================
// COMMENT ANALYZER AGENTS (3)
// ============================================
class CommentAnalyzer extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `comment_analyzer_${instanceId}`,
            name: `Comment Analyzer #${instanceId}`,
            role: 'analyzer',
            team: 'prospect-acquisition',
            subTeam: 'analysis',
            platforms: ['all'],
            capabilities: ['sentiment-analysis', 'intent-detection', 'keyword-extraction', 'urgency-scoring'],
            priority: 'high'
        });

        this.intentPatterns = {
            'very-high': [
                /sign me up/i, /i want/i, /count me in/i, /take my money/i,
                /how do i start/i, /ready to/i, /let's do/i
            ],
            'high': [
                /interested/i, /tell me more/i, /how does/i, /where can i/i,
                /contact/i, /call me/i, /dm me/i
            ],
            'medium': [
                /what is/i, /explain/i, /how much/i, /\?$/,
                /sounds good/i, /makes sense/i
            ],
            'low': [
                /nice/i, /cool/i, /thanks/i, /good/i
            ]
        };
    }

    async process(input, context) {
        const { comments, platform } = input;

        const analyzed = [];
        for (const comment of comments || []) {
            analyzed.push({
                original: comment,
                analysis: this.deepAnalyze(comment),
                platform,
                analyzedAt: new Date()
            });
        }

        // Sort by priority
        analyzed.sort((a, b) => b.analysis.priorityScore - a.analysis.priorityScore);

        return {
            totalAnalyzed: analyzed.length,
            highPriority: analyzed.filter(a => a.analysis.intent === 'very-high' || a.analysis.intent === 'high'),
            analyzed
        };
    }

    deepAnalyze(comment) {
        const text = comment.text || comment;
        let intent = 'low';
        let priorityScore = 0;

        // Check intent patterns
        for (const [level, patterns] of Object.entries(this.intentPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    intent = level;
                    priorityScore = level === 'very-high' ? 100 :
                        level === 'high' ? 75 :
                            level === 'medium' ? 50 : 25;
                    break;
                }
            }
            if (priorityScore > 0) break;
        }

        // Extract keywords
        const keywords = this.extractKeywords(text);

        // Bonus for strategy keywords
        if (keywords.includes('dynasty') || keywords.includes('waterfall')) {
            priorityScore = Math.min(priorityScore + 25, 100);
        }

        return {
            text,
            intent,
            priorityScore,
            keywords,
            sentiment: this.quickSentiment(text),
            questionAsked: text.includes('?'),
            wordCount: text.split(/\s+/).length
        };
    }

    extractKeywords(text) {
        const importantWords = [
            'dynasty', 'waterfall', 'banking', 'wealth', 'insurance',
            'iul', 'life', 'health', 'auto', 'home', 'medicare',
            'tax', 'free', 'generational', 'legacy', 'retirement',
            'interested', 'quote', 'price', 'cost', 'help'
        ];

        const textLower = text.toLowerCase();
        return importantWords.filter(word => textLower.includes(word));
    }

    quickSentiment(text) {
        const positive = ['love', 'great', 'amazing', 'yes', 'interested', 'want', 'need', 'please'];
        const negative = ['no', 'scam', 'fake', 'bad', 'hate', 'never'];

        const textLower = text.toLowerCase();
        const posCount = positive.filter(w => textLower.includes(w)).length;
        const negCount = negative.filter(w => textLower.includes(w)).length;

        if (posCount > negCount + 1) return 'very-positive';
        if (posCount > negCount) return 'positive';
        if (negCount > posCount) return 'negative';
        return 'neutral';
    }
}

// ============================================
// ENGAGEMENT TRACKER AGENTS (3)
// ============================================
class EngagementTracker extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `engagement_tracker_${instanceId}`,
            name: `Engagement Tracker #${instanceId}`,
            role: 'tracker',
            team: 'prospect-acquisition',
            subTeam: 'tracking',
            platforms: ['all'],
            capabilities: ['engagement-monitoring', 'trend-detection', 'performance-tracking', 'anomaly-detection'],
            priority: 'medium'
        });

        this.metrics = {
            totalEngagements: 0,
            byPlatform: {},
            byType: {},
            hourlyTrends: {}
        };
    }

    async process(input, context) {
        const { engagements, timeframe } = input;

        // Update metrics
        for (const engagement of engagements || []) {
            this.trackEngagement(engagement);
        }

        // Calculate trends
        const trends = this.calculateTrends(timeframe);

        return {
            summary: this.getSummary(),
            trends,
            anomalies: this.detectAnomalies(),
            recommendations: this.generateRecommendations(trends)
        };
    }

    trackEngagement(engagement) {
        this.metrics.totalEngagements++;

        const platform = engagement.platform || 'unknown';
        const type = engagement.type || 'unknown';
        const hour = new Date().getHours();

        this.metrics.byPlatform[platform] = (this.metrics.byPlatform[platform] || 0) + 1;
        this.metrics.byType[type] = (this.metrics.byType[type] || 0) + 1;
        this.metrics.hourlyTrends[hour] = (this.metrics.hourlyTrends[hour] || 0) + 1;
    }

    calculateTrends(timeframe) {
        return {
            topPlatform: Object.entries(this.metrics.byPlatform)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
            topEngagementType: Object.entries(this.metrics.byType)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
            peakHour: Object.entries(this.metrics.hourlyTrends)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'
        };
    }

    detectAnomalies() {
        // Detect unusual patterns
        const anomalies = [];
        const avgPerPlatform = this.metrics.totalEngagements / Object.keys(this.metrics.byPlatform).length;

        for (const [platform, count] of Object.entries(this.metrics.byPlatform)) {
            if (count > avgPerPlatform * 3) {
                anomalies.push({ type: 'spike', platform, count });
            }
        }

        return anomalies;
    }

    generateRecommendations(trends) {
        const recommendations = [];

        if (trends.topPlatform === 'tiktok') {
            recommendations.push('Focus content creation on TikTok - highest engagement');
        }
        if (trends.peakHour >= 18 && trends.peakHour <= 21) {
            recommendations.push('Schedule posts for evening hours (6-9 PM)');
        }

        return recommendations;
    }

    getSummary() {
        return {
            total: this.metrics.totalEngagements,
            platforms: this.metrics.byPlatform,
            types: this.metrics.byType
        };
    }
}

// ============================================
// KEYWORD MONITOR AGENTS (3)
// ============================================
class KeywordMonitor extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `keyword_monitor_${instanceId}`,
            name: `Keyword Monitor #${instanceId}`,
            role: 'monitor',
            team: 'prospect-acquisition',
            subTeam: 'keywords',
            platforms: ['all'],
            capabilities: ['keyword-tracking', 'mention-alerts', 'competitor-monitoring', 'brand-tracking'],
            priority: 'medium'
        });

        this.trackedKeywords = {
            brand: ['flo faction', 'flofaction', 'hri insurance'],
            product: ['dynasty strategy', 'waterfall method', 'infinite banking', 'iul'],
            competitor: ['state farm', 'allstate', 'progressive', 'geico'],
            industry: ['life insurance', 'whole life', 'term life', 'medicare', 'aca']
        };

        this.mentions = [];
    }

    async process(input, context) {
        const { content, source, timestamp } = input;

        const matches = this.findKeywordMatches(content);

        if (matches.length > 0) {
            const mention = {
                source,
                content,
                matches,
                timestamp: timestamp || new Date(),
                processed: new Date()
            };
            this.mentions.push(mention);

            // Alert for brand mentions
            const brandMentions = matches.filter(m => m.category === 'brand');
            if (brandMentions.length > 0) {
                return {
                    alert: true,
                    type: 'brand-mention',
                    mention,
                    action: 'respond-immediately'
                };
            }
        }

        return {
            matches,
            totalMentions: this.mentions.length,
            recentMentions: this.mentions.slice(-10)
        };
    }

    findKeywordMatches(content) {
        const text = (content || '').toLowerCase();
        const matches = [];

        for (const [category, keywords] of Object.entries(this.trackedKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    matches.push({ keyword, category });
                }
            }
        }

        return matches;
    }
}

// ============================================
// TREND ANALYZER AGENTS (2)
// ============================================
class TrendAnalyzer extends FloFactionAgent {
    constructor(instanceId) {
        super({
            id: `trend_analyzer_${instanceId}`,
            name: `Trend Analyzer #${instanceId}`,
            role: 'analyzer',
            team: 'prospect-acquisition',
            subTeam: 'trends',
            platforms: ['all'],
            capabilities: ['trend-detection', 'viral-prediction', 'topic-clustering', 'timing-optimization'],
            priority: 'medium'
        });

        this.trendData = {
            topics: {},
            hashtags: {},
            formats: {}
        };
    }

    async process(input, context) {
        const { posts, engagement, timeframe } = input;

        // Analyze what's trending
        const trends = this.analyzeTrends(posts);

        return {
            topTrends: trends.top,
            risingTrends: trends.rising,
            recommendations: this.generateContentRecommendations(trends),
            optimalPostingTimes: this.calculateOptimalTimes(engagement)
        };
    }

    analyzeTrends(posts) {
        const topicCounts = {};
        const hashtagCounts = {};

        for (const post of posts || []) {
            // Count topics
            const topics = this.extractTopics(post.content);
            topics.forEach(t => {
                topicCounts[t] = (topicCounts[t] || 0) + 1;
            });

            // Count hashtags
            const hashtags = this.extractHashtags(post.content);
            hashtags.forEach(h => {
                hashtagCounts[h] = (hashtagCounts[h] || 0) + 1;
            });
        }

        return {
            top: Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
            rising: Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
        };
    }

    extractTopics(content) {
        const topics = [];
        const text = (content || '').toLowerCase();

        if (text.includes('wealth') || text.includes('money')) topics.push('wealth-building');
        if (text.includes('insurance')) topics.push('insurance');
        if (text.includes('retire') || text.includes('retirement')) topics.push('retirement');
        if (text.includes('tax')) topics.push('tax-strategy');

        return topics;
    }

    extractHashtags(content) {
        const matches = (content || '').match(/#\w+/g) || [];
        return matches.map(h => h.toLowerCase());
    }

    calculateOptimalTimes(engagement) {
        return {
            weekday: '6:00 PM - 9:00 PM',
            weekend: '10:00 AM - 2:00 PM',
            bestDays: ['Tuesday', 'Thursday', 'Saturday']
        };
    }

    generateContentRecommendations(trends) {
        return [
            `Create content about: ${trends.top[0]?.[0] || 'wealth-building'}`,
            `Use trending hashtags: ${trends.rising.slice(0, 3).map(t => t[0]).join(', ')}`,
            'Consider short-form video content (TikTok/Reels format)'
        ];
    }
}

// ============================================
// FACTORY FUNCTION
// ============================================
function createProspectAcquisitionSquad(orchestrator) {
    const agents = [];

    // TikTok Lead Harvesters (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new TikTokLeadHarvester(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Instagram Lead Harvesters (5)
    for (let i = 1; i <= 5; i++) {
        const agent = new InstagramLeadHarvester(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Facebook Lead Harvesters (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new FacebookLeadHarvester(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // LinkedIn Prospect Agents (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new LinkedInProspectAgent(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Comment Analyzers (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new CommentAnalyzer(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Engagement Trackers (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new EngagementTracker(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Keyword Monitors (3)
    for (let i = 1; i <= 3; i++) {
        const agent = new KeywordMonitor(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    // Trend Analyzers (2)
    for (let i = 1; i <= 2; i++) {
        const agent = new TrendAnalyzer(i);
        orchestrator.registerAgent(agent);
        agents.push(agent);
    }

    console.log(`✅ Prospect Acquisition Squad deployed: ${agents.length} agents`);
    return agents;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    TikTokLeadHarvester,
    InstagramLeadHarvester,
    FacebookLeadHarvester,
    LinkedInProspectAgent,
    CommentAnalyzer,
    EngagementTracker,
    KeywordMonitor,
    TrendAnalyzer,
    createProspectAcquisitionSquad
};
