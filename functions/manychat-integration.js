/**
 * ManyChat Integration Module
 * Flo Faction LLC - Multi-channel Chatbot Automation
 *
 * This module provides integration with ManyChat for automated
 * messaging across Facebook Messenger, Instagram, WhatsApp, and SMS.
 */

const axios = require('axios');

class ManyChatIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.manychat.com/fb';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get subscriber information by ID
     * @param {string} subscriberId - ManyChat subscriber ID
     */
    async getSubscriber(subscriberId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/subscriber/getInfo`,
                {
                    headers: this.headers,
                    params: { subscriber_id: subscriberId }
                }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat getSubscriber error:', error.message);
            throw error;
        }
    }

    /**
     * Find subscriber by custom field (e.g., email, phone)
     * @param {string} fieldName - Custom field name
     * @param {string} fieldValue - Value to search for
     */
    async findSubscriberByField(fieldName, fieldValue) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/subscriber/findByCustomField`,
                {
                    headers: this.headers,
                    params: {
                        field_name: fieldName,
                        field_value: fieldValue
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat findSubscriber error:', error.message);
            throw error;
        }
    }

    /**
     * Send content to a subscriber
     * @param {string} subscriberId - ManyChat subscriber ID
     * @param {object} content - Message content
     */
    async sendContent(subscriberId, content) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/sending/sendContent`,
                {
                    subscriber_id: subscriberId,
                    data: content
                },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat sendContent error:', error.message);
            throw error;
        }
    }

    /**
     * Send a flow to a subscriber
     * @param {string} subscriberId - ManyChat subscriber ID
     * @param {string} flowNs - Flow namespace
     */
    async sendFlow(subscriberId, flowNs) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/sending/sendFlow`,
                {
                    subscriber_id: subscriberId,
                    flow_ns: flowNs
                },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat sendFlow error:', error.message);
            throw error;
        }
    }

    /**
     * Set custom field value for subscriber
     * @param {string} subscriberId - ManyChat subscriber ID
     * @param {string} fieldName - Custom field name
     * @param {string} fieldValue - Value to set
     */
    async setCustomField(subscriberId, fieldName, fieldValue) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/subscriber/setCustomField`,
                {
                    subscriber_id: subscriberId,
                    field_name: fieldName,
                    field_value: fieldValue
                },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat setCustomField error:', error.message);
            throw error;
        }
    }

    /**
     * Add tag to subscriber
     * @param {string} subscriberId - ManyChat subscriber ID
     * @param {string} tagName - Tag to add
     */
    async addTag(subscriberId, tagName) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/subscriber/addTag`,
                {
                    subscriber_id: subscriberId,
                    tag_name: tagName
                },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat addTag error:', error.message);
            throw error;
        }
    }

    /**
     * Remove tag from subscriber
     * @param {string} subscriberId - ManyChat subscriber ID
     * @param {string} tagName - Tag to remove
     */
    async removeTag(subscriberId, tagName) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/subscriber/removeTag`,
                {
                    subscriber_id: subscriberId,
                    tag_name: tagName
                },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat removeTag error:', error.message);
            throw error;
        }
    }

    /**
     * Create a new subscriber
     * @param {object} subscriberData - Subscriber information
     */
    async createSubscriber(subscriberData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/subscriber/createSubscriber`,
                subscriberData,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat createSubscriber error:', error.message);
            throw error;
        }
    }

    /**
     * Get all custom fields
     */
    async getCustomFields() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/page/getCustomFields`,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat getCustomFields error:', error.message);
            throw error;
        }
    }

    /**
     * Get all tags
     */
    async getTags() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/page/getTags`,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat getTags error:', error.message);
            throw error;
        }
    }

    /**
     * Get all flows
     */
    async getFlows() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/page/getFlows`,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('ManyChat getFlows error:', error.message);
            throw error;
        }
    }
}

// Flo Faction specific flows and tags
const FloFactionManyChatConfig = {
    // Service-specific tags
    tags: {
        // Insurance Tags
        autoInsurance: 'auto_insurance_lead',
        homeInsurance: 'home_insurance_lead',
        lifeInsurance: 'life_insurance_lead',
        healthInsurance: 'health_insurance_lead',
        medicare: 'medicare_lead',
        disability: 'disability_lead',

        // Wealth Management Tags
        financialPlanning: 'financial_planning_lead',
        retirement: 'retirement_planning_lead',
        investment: 'investment_lead',
        legacy: 'legacy_planning_lead',

        // Digital Services Tags
        webDevelopment: 'web_dev_lead',
        aiAutomation: 'ai_automation_lead',
        creative: 'creative_services_lead',

        // Lead Status Tags
        newLead: 'new_lead',
        contacted: 'contacted',
        qualified: 'qualified',
        customer: 'customer',
        vip: 'vip_customer'
    },

    // Custom fields to track
    customFields: {
        serviceInterest: 'service_interest',
        leadSource: 'lead_source',
        tier: 'service_tier',
        assignedAgent: 'assigned_agent',
        lastContactDate: 'last_contact_date',
        insuranceType: 'insurance_type',
        estimatedValue: 'estimated_value'
    },

    // Flow namespaces for different scenarios
    flows: {
        welcomeSequence: 'welcome_sequence',
        insuranceQuote: 'insurance_quote_flow',
        appointmentBooking: 'appointment_booking',
        followUp: 'follow_up_sequence',
        reEngagement: 're_engagement_flow'
    }
};

/**
 * Helper function to sync intake form submission with ManyChat
 * @param {object} intakeData - Data from intake form
 * @param {ManyChatIntegration} manyChat - ManyChat instance
 */
async function syncIntakeToManyChat(intakeData, manyChat) {
    try {
        // Find or create subscriber
        let subscriber = await manyChat.findSubscriberByField('email', intakeData.email);

        if (!subscriber || !subscriber.data) {
            // Create new subscriber if not found
            subscriber = await manyChat.createSubscriber({
                first_name: intakeData.firstName,
                last_name: intakeData.lastName,
                email: intakeData.email,
                phone: intakeData.phone
            });
        }

        const subscriberId = subscriber.data?.id;
        if (!subscriberId) {
            console.log('Could not get subscriber ID');
            return null;
        }

        // Set custom fields
        await manyChat.setCustomField(subscriberId, 'service_interest', intakeData.serviceType);
        await manyChat.setCustomField(subscriberId, 'lead_source', intakeData.source_page || 'website');

        if (intakeData.tier) {
            await manyChat.setCustomField(subscriberId, 'service_tier', intakeData.tier);
        }

        // Add appropriate tag based on service type
        const serviceTagMap = {
            'auto-insurance': FloFactionManyChatConfig.tags.autoInsurance,
            'home-insurance': FloFactionManyChatConfig.tags.homeInsurance,
            'life-insurance': FloFactionManyChatConfig.tags.lifeInsurance,
            'health-insurance': FloFactionManyChatConfig.tags.healthInsurance,
            'medicare': FloFactionManyChatConfig.tags.medicare,
            'disability-insurance': FloFactionManyChatConfig.tags.disability,
            'financial-planning': FloFactionManyChatConfig.tags.financialPlanning,
            'retirement-planning': FloFactionManyChatConfig.tags.retirement,
            'investment-strategies': FloFactionManyChatConfig.tags.investment,
            'legacy-planning': FloFactionManyChatConfig.tags.legacy,
            'web-development': FloFactionManyChatConfig.tags.webDevelopment,
            'ai-automation': FloFactionManyChatConfig.tags.aiAutomation,
            'creative-services': FloFactionManyChatConfig.tags.creative
        };

        const serviceTag = serviceTagMap[intakeData.serviceType];
        if (serviceTag) {
            await manyChat.addTag(subscriberId, serviceTag);
        }

        // Add new lead tag
        await manyChat.addTag(subscriberId, FloFactionManyChatConfig.tags.newLead);

        // Trigger welcome sequence
        await manyChat.sendFlow(subscriberId, FloFactionManyChatConfig.flows.welcomeSequence);

        return { success: true, subscriberId };
    } catch (error) {
        console.error('Error syncing to ManyChat:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    ManyChatIntegration,
    FloFactionManyChatConfig,
    syncIntakeToManyChat
};
