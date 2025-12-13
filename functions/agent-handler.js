// Flo Faction - Enhanced Agent Handler for Cloud Functions
// Manages agent-specific routing and interactions for different pages

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const axios = require('axios');

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp();
}

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io';

// Page-specific agent configurations
const AGENT_ROUTING = {
  home: {
    agentId: 'agent_2401kcafh68jer4s67d2d3y37mcv',
    agentName: 'Home Guide',
    purpose: 'Welcome and qualify new visitors'
  },
  services: {
    agentId: 'agent_4101kcageta4eqh970hcgxqcp7n1',
    agentName: 'Services Consultant',
    purpose: 'Explain services and help with selection'
  },
  insurance: {
    agentId: 'agent_9501ka7zqvgwfsrrzzxwyrshjmcx',
    agentName: 'Insurance Specialist',
    purpose: 'Provide insurance information and quotes'
  },
  contact: {
    agentId: 'agent_2401kcafh68jer4s67d2d3y37mcv',
    agentName: 'Sales & Support',
    purpose: 'Handle inquiries and lead qualification'
  }
};

/**
 * Route agent interaction based on page and context
 */
exports.routeAgentInteraction = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { pageType, userInput, userEmail, userName } = req.body;

      // Validate required fields
      if (!pageType || !userInput) {
        return res.status(400).json({
          error: 'Missing required fields: pageType, userInput'
        });
      }

      // Get agent configuration for the page
      const agentConfig = AGENT_ROUTING[pageType];
      if (!agentConfig) {
        return res.status(400).json({
          error: `Invalid page type: ${pageType}`
        });
      }

      // Log interaction to Firestore
      const interactionRecord = await admin.firestore()
        .collection('agent_interactions')
        .add({
          pageType,
          agentId: agentConfig.agentId,
          agentName: agentConfig.agentName,
          userInput,
          userEmail: userEmail || 'anonymous',
          userName: userName || 'Anonymous',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          status: 'initiated',
          response: null
        });

      // Process interaction based on page type
      let response = {};
      switch (pageType) {
        case 'home':
          response = await handleHomePageInteraction(userInput, agentConfig);
          break;
        case 'services':
          response = await handleServicesInteraction(userInput, agentConfig);
          break;
        case 'insurance':
          response = await handleInsuranceInteraction(userInput, agentConfig);
          break;
        case 'contact':
          response = await handleContactInteraction(userInput, agentConfig, userEmail, userName);
          break;
        default:
          response = { message: 'Agent ready to assist' };
      }

      // Update Firestore with response
      await interactionRecord.update({
        response,
        status: 'completed'
      });

      res.status(200).json({
        success: true,
        agent: agentConfig.agentName,
        pageType,
        response,
        interactionId: interactionRecord.id
      });

    } catch (error) {
      console.error('Agent routing error:', error);
      res.status(500).json({
        error: 'Failed to process agent interaction',
        details: error.message
      });
    }
  });
});

/**
 * Handle home page interactions
 */
async function handleHomePageInteraction(userInput, agentConfig) {
  // Extract intent and provide appropriate guidance
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes('insurance') || lowerInput.includes('coverage')) {
    return {
      message: 'Great! We offer comprehensive insurance solutions for entrepreneurs. Visit our Insurance page to learn more.',
      recommendedPage: 'insurance',
      suggestedServices: ['Health & Life Insurance', 'Business Liability Coverage', 'Disability Protection']
    };
  } else if (lowerInput.includes('wealth') || lowerInput.includes('investment') || lowerInput.includes('planning')) {
    return {
      message: 'Excellent! Our wealth building services help entrepreneurs grow and protect their assets. Explore our Services page.',
      recommendedPage: 'services',
      suggestedServices: ['Wealth Building', 'Financial Planning', 'Investment Strategies']
    };
  } else {
    return {
      message: 'Welcome to Flo Faction! How can we help you today? Would you like to learn about our insurance, services, or wealth building options?',
      options: ['Insurance', 'Services', 'Wealth Building']
    };
  }
}

/**
 * Handle services page interactions
 */
async function handleServicesInteraction(userInput, agentConfig) {
  const services = {
    businessInsurance: 'Comprehensive coverage for business owners with flexible plans',
    wealthBuilding: 'AI-driven strategies to grow and protect your wealth',
    financialPlanning: 'Personalized plans tailored to your unique financial goals',
    insuranceSolutions: 'Tailored coverage options for entrepreneurs'
  };

  return {
    message: 'Our services are designed specifically for entrepreneurs like you.',
    availableServices: Object.keys(services),
    descriptions: services
  };
}

/**
 * Handle insurance page interactions
 */
async function handleInsuranceInteraction(userInput, agentConfig) {
  const coverageTypes = {
    health: 'Individual and family health insurance plans',
    liability: 'Business liability protection for your company',
    disability: 'Income replacement coverage if you become unable to work',
    retirement: 'Long-term security planning for your future'
  };

  return {
    message: 'Our insurance specialist is ready to help you find the right coverage.',
    coverageTypes,
    nextStep: 'Would you like a personalized quote?'
  };
}

/**
 * Handle contact page interactions
 */
async function handleContactInteraction(userInput, agentConfig, userEmail, userName) {
  // Store lead information
  const leadRecord = await admin.firestore()
    .collection('leads')
    .add({
      name: userName || 'Unknown',
      email: userEmail || 'not_provided',
      inquiry: userInput,
      pageOrigin: 'contact',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new',
      qualificationScore: calculateLeadScore(userInput)
    });

  return {
    message: 'Thank you for reaching out! A Flo Faction specialist will contact you shortly.',
    leadId: leadRecord.id,
    followUpMessage: `We'll follow up with ${userEmail || 'you'} within 24 hours.`,
    schedulingUrl: 'https://calendly.com/flofaction' // Update with actual calendly link
  };
}

/**
 * Calculate lead qualification score based on inquiry
 */
function calculateLeadScore(inquiry) {
  let score = 0;
  const keywords = {
    'insurance': 3,
    'quote': 3,
    'coverage': 2,
    'plan': 2,
    'business': 2,
    'help': 1,
    'information': 1
  };

  const lowerInquiry = inquiry.toLowerCase();
  for (const [keyword, points] of Object.entries(keywords)) {
    if (lowerInquiry.includes(keyword)) {
      score += points;
    }
  }

  return Math.min(score, 10); // Cap at 10
}

/**
 * Get agent statistics for dashboard
 */
exports.getAgentStats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const statsSnapshot = await admin.firestore()
        .collection('agent_interactions')
        .where('timestamp', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        .get();

      const stats = {
        totalInteractions: statsSnapshot.size,
        byPageType: {},
        byAgent: {},
        completedCount: 0,
        averageResponseTime: 0
      };

      statsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Count by page type
        stats.byPageType[data.pageType] = (stats.byPageType[data.pageType] || 0) + 1;
        
        // Count by agent
        stats.byAgent[data.agentName] = (stats.byAgent[data.agentName] || 0) + 1;
        
        // Count completed
        if (data.status === 'completed') {
          stats.completedCount++;
        }
      });

      res.status(200).json({
        success: true,
        stats,
        period: '30 days'
      });

    } catch (error) {
      console.error('Error getting agent stats:', error);
      res.status(500).json({
        error: 'Failed to retrieve agent statistics',
        details: error.message
      });
    }
  });
});

module.exports = { ...exports };
