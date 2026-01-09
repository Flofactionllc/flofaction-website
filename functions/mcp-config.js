/**
 * MCP (Model Context Protocol) Servers Configuration
 * Flo Faction LLC - Maximum Automation Infrastructure
 *
 * This file documents recommended MCP servers for integration
 * to achieve maximum automation capabilities.
 */

const MCPConfig = {
    version: "1.0.0",
    lastUpdated: "2026-01-09",

    // Official MCP Servers (from Model Context Protocol)
    officialServers: [
        {
            id: "gmail",
            package: "@modelcontextprotocol/server-gmail",
            purpose: "Direct Gmail integration",
            benefits: [
                "Read emails programmatically",
                "Send emails automatically",
                "Search email archive",
                "Label and organize messages"
            ],
            useCases: [
                "Automate email responses",
                "Extract leads from emails",
                "Email campaign management",
                "Client communication tracking"
            ],
            priority: "high",
            status: "recommended"
        },
        {
            id: "google-drive",
            package: "@modelcontextprotocol/server-google-drive",
            purpose: "File management automation",
            benefits: [
                "Upload client documents",
                "Download and process files",
                "Organize folder structure",
                "Share files automatically"
            ],
            useCases: [
                "Policy document storage",
                "Client document retrieval",
                "Automated file organization",
                "Document version control"
            ],
            priority: "high",
            status: "recommended"
        },
        {
            id: "slack",
            package: "@modelcontextprotocol/server-slack",
            purpose: "Team communication automation",
            benefits: [
                "Send notifications automatically",
                "Create channels on demand",
                "Post updates to channels",
                "Search message history"
            ],
            useCases: [
                "Lead alerts to team",
                "Status updates",
                "Team coordination",
                "Workflow notifications"
            ],
            priority: "medium",
            status: "recommended"
        },
        {
            id: "hubspot",
            package: "@modelcontextprotocol/server-hubspot",
            purpose: "CRM automation",
            benefits: [
                "Create contacts automatically",
                "Update deal stages",
                "Sync lead data",
                "Track interactions"
            ],
            useCases: [
                "Sync leads from intake forms",
                "Update pipeline status",
                "Track customer interactions",
                "Automated CRM updates"
            ],
            priority: "high",
            status: "recommended"
        },
        {
            id: "github",
            package: "@modelcontextprotocol/server-github",
            purpose: "Code repository management",
            benefits: [
                "Push code changes",
                "Create and manage issues",
                "Trigger deployments",
                "Manage pull requests"
            ],
            useCases: [
                "Automated deployments",
                "Version control automation",
                "Issue tracking integration",
                "Code review workflows"
            ],
            priority: "medium",
            status: "recommended"
        },
        {
            id: "postgres",
            package: "@modelcontextprotocol/server-postgres",
            purpose: "Database operations",
            benefits: [
                "Direct SQL queries",
                "Data updates and inserts",
                "Complex data analysis",
                "Database migrations"
            ],
            useCases: [
                "Lead data storage",
                "Analytics queries",
                "Reporting generation",
                "Data synchronization"
            ],
            priority: "medium",
            status: "optional"
        },
        {
            id: "filesystem",
            package: "@modelcontextprotocol/server-filesystem",
            purpose: "Local file operations",
            benefits: [
                "Read configuration files",
                "Write log files",
                "Manage local storage",
                "Process uploaded documents"
            ],
            useCases: [
                "Config management",
                "Log analysis",
                "Document processing",
                "Backup operations"
            ],
            priority: "low",
            status: "recommended"
        },
        {
            id: "brave-search",
            package: "@modelcontextprotocol/server-brave-search",
            purpose: "Web search capability",
            benefits: [
                "Search the web",
                "Research competitors",
                "Find market data",
                "Gather intelligence"
            ],
            useCases: [
                "Market intelligence gathering",
                "Competitor research",
                "Industry news monitoring",
                "Customer research"
            ],
            priority: "low",
            status: "optional"
        },
        {
            id: "puppeteer",
            package: "@modelcontextprotocol/server-puppeteer",
            purpose: "Browser automation",
            benefits: [
                "Scrape web data",
                "Automate web forms",
                "Test websites",
                "Generate screenshots"
            ],
            useCases: [
                "Lead generation from web",
                "Automated testing",
                "Data extraction",
                "Website monitoring"
            ],
            priority: "medium",
            status: "optional"
        },
        {
            id: "sequential-thinking",
            package: "@modelcontextprotocol/server-sequential-thinking",
            purpose: "Enhanced reasoning",
            benefits: [
                "Complex problem solving",
                "Multi-step planning",
                "Logic chains",
                "Decision trees"
            ],
            useCases: [
                "Multi-step automation planning",
                "Complex workflow design",
                "Decision automation",
                "Risk assessment"
            ],
            priority: "medium",
            status: "recommended"
        }
    ],

    // Custom MCP Servers (to be developed)
    customServers: [
        {
            id: "whatsapp-business",
            name: "Custom WhatsApp MCP Server",
            purpose: "WhatsApp Business API integration",
            benefits: [
                "Send WhatsApp messages",
                "Receive and process messages",
                "Template message support",
                "Media sharing"
            ],
            useCases: [
                "Client communication",
                "Lead follow-up",
                "Appointment reminders",
                "Document sharing"
            ],
            developmentStatus: "planned",
            priority: "high",
            integrationPoint: "772-208-9646 (flofactionllc@gmail.com)"
        },
        {
            id: "stripe-payments",
            name: "Custom Stripe MCP Server",
            purpose: "Payment processing automation",
            benefits: [
                "Process payments",
                "Manage subscriptions",
                "Generate invoices",
                "Handle refunds"
            ],
            useCases: [
                "Billing automation",
                "Subscription management",
                "Payment tracking",
                "Revenue reporting"
            ],
            developmentStatus: "planned",
            priority: "high"
        },
        {
            id: "twilio-voice",
            name: "Custom Twilio/Google Voice MCP",
            purpose: "SMS and Voice automation",
            benefits: [
                "Send SMS messages",
                "Automated calling",
                "Voice transcription",
                "IVR integration"
            ],
            useCases: [
                "Lead follow-up SMS",
                "Appointment reminders",
                "Voice message transcription",
                "Automated phone trees"
            ],
            developmentStatus: "planned",
            priority: "medium"
        },
        {
            id: "zapier-universal",
            name: "Custom Zapier MCP Server",
            purpose: "Universal app connectivity",
            benefits: [
                "Connect to 5000+ apps",
                "No-code automation",
                "Webhook triggers",
                "Multi-step workflows"
            ],
            useCases: [
                "Cross-platform workflows",
                "Legacy system integration",
                "Quick prototyping",
                "Complex automation chains"
            ],
            developmentStatus: "planned",
            priority: "medium"
        }
    ],

    // Integration priority matrix
    priorityMatrix: {
        phase1_immediate: [
            "gmail",
            "google-drive",
            "hubspot",
            "whatsapp-business"
        ],
        phase2_short_term: [
            "slack",
            "stripe-payments",
            "sequential-thinking"
        ],
        phase3_medium_term: [
            "github",
            "puppeteer",
            "twilio-voice"
        ],
        phase4_long_term: [
            "postgres",
            "filesystem",
            "brave-search",
            "zapier-universal"
        ]
    },

    // Environment variable requirements
    requiredEnvVars: {
        gmail: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"],
        googleDrive: ["GOOGLE_DRIVE_CLIENT_ID", "GOOGLE_DRIVE_CLIENT_SECRET"],
        slack: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"],
        hubspot: ["HUBSPOT_API_KEY"],
        github: ["GITHUB_TOKEN"],
        whatsapp: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"],
        stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]
    },

    // Installation commands
    installCommands: {
        official: "npm install @modelcontextprotocol/server-{name}",
        example: [
            "npm install @modelcontextprotocol/server-gmail",
            "npm install @modelcontextprotocol/server-google-drive",
            "npm install @modelcontextprotocol/server-slack",
            "npm install @modelcontextprotocol/server-hubspot",
            "npm install @modelcontextprotocol/server-github",
            "npm install @modelcontextprotocol/server-sequential-thinking"
        ]
    }
};

// Helper function to get all high priority servers
MCPConfig.getHighPriorityServers = function() {
    return [
        ...this.officialServers.filter(s => s.priority === "high"),
        ...this.customServers.filter(s => s.priority === "high")
    ];
};

// Helper function to get installation status
MCPConfig.getInstallationGuide = function() {
    return {
        step1: "Review priority matrix to determine phase",
        step2: "Check required environment variables",
        step3: "Install official packages via npm",
        step4: "Configure authentication",
        step5: "Test integration in development",
        step6: "Deploy to production"
    };
};

module.exports = MCPConfig;
