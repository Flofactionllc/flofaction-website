/**
 * FLO FACTION COMPLETE BUSINESS BLUEPRINT & TECH STACK
 * Created: Jan 3, 2026 | Owner: Paul Edwards | Entity: Flo Faction LLC
 *
 * This configuration file contains the complete business blueprint
 * for Flo Faction LLC, including services, products, tech stack,
 * and future SaaS roadmap.
 */

const FloFactionConfig = {
    // Company Information
    company: {
        name: "Flo Faction LLC",
        owner: "Paul Edwards",
        created: "Jan 3, 2026",

        // Vision & Mission
        vision: {
            goal: "Become a Top-Tier AI Company",
            objectives: [
                "Position Flo Faction as industry leader in AI-powered services",
                "Compete with best-in-class AI companies",
                "Deliver cutting-edge automation and intelligence"
            ]
        },

        // Consumer Packaging Strategy
        packagingStrategy: {
            principles: [
                "Simple, elegant, consumer-friendly interfaces",
                "Complex AI hidden behind beautiful UX",
                "'It just works' mentality",
                "Premium positioning with accessible pricing"
            ]
        }
    },

    // Contact Information by Division
    contacts: {
        hriInsurance: {
            email: "paul@hriinsurance.com",
            platform: "ForAgentsOnly.com",
            carriers: 7,
            products: ["Auto Insurance", "Home Insurance", "Property & Casualty"],
            licenseType: "20-44 License"
        },
        floFactionInsurance: {
            email: "flofaction.insurance@gmail.com",
            products: ["Life Insurance", "Health Insurance (ACA/Marketplace)", "Medicare Plans", "Disability Insurance"],
            description: "All NON-20-44 products"
        },
        business: {
            email: "flofaction.business@gmail.com",
            phone: "772-208-9646",
            whatsapp: "flofactionllc@gmail.com"
        }
    },

    // Current Services & Products
    services: {
        // Insurance Division - HRI Insurance (20-44 License Products)
        hriInsurance: {
            name: "HRI Insurance",
            brand: "HRI Insurance ONLY",
            email: "paul@hriinsurance.com",
            platform: "ForAgentsOnly.com",
            licenseType: "20-44 License",
            carriers: 7,
            products: [
                {
                    id: "auto-insurance",
                    name: "Auto Insurance",
                    icon: "fa-car",
                    description: "Comprehensive auto coverage with competitive rates"
                },
                {
                    id: "home-insurance",
                    name: "Home Insurance",
                    icon: "fa-home",
                    description: "Protect your home and belongings"
                },
                {
                    id: "property-casualty",
                    name: "Property & Casualty",
                    icon: "fa-building",
                    description: "Business and property protection"
                }
            ]
        },

        // Insurance Division - Flo Faction Insurance (Non 20-44 Products)
        floFactionInsurance: {
            name: "Flo Faction Insurance",
            email: "flofaction.insurance@gmail.com",
            products: [
                {
                    id: "life-insurance",
                    name: "Life Insurance",
                    icon: "fa-heart",
                    description: "Protect your family's financial future"
                },
                {
                    id: "health-insurance",
                    name: "Health Insurance (ACA/Marketplace)",
                    icon: "fa-medkit",
                    description: "Affordable healthcare coverage options"
                },
                {
                    id: "medicare",
                    name: "Medicare Plans",
                    icon: "fa-user-md",
                    description: "Medicare Advantage, Supplement, and Part D plans"
                },
                {
                    id: "disability",
                    name: "Disability Insurance",
                    icon: "fa-wheelchair",
                    description: "Income protection when you need it most"
                }
            ]
        },

        // Wealth Management Division
        wealthManagement: {
            name: "Wealth Management",
            icon: "fa-chart-line",
            products: [
                {
                    id: "financial-planning",
                    name: "Financial Planning",
                    description: "Comprehensive financial strategy development"
                },
                {
                    id: "investment-strategies",
                    name: "Investment Strategies",
                    description: "Portfolio optimization and wealth growth"
                },
                {
                    id: "retirement-planning",
                    name: "Retirement Planning (401k/IRA)",
                    description: "Secure your retirement future"
                },
                {
                    id: "portfolio-management",
                    name: "Portfolio Management",
                    description: "Active management of your investments"
                }
            ]
        },

        // AI & Automation Services
        aiAutomation: {
            name: "AI & Automation Services",
            icon: "fa-robot",
            products: [
                {
                    id: "customer-support-automation",
                    name: "Customer Support Automation",
                    description: "24/7 AI-powered customer service"
                },
                {
                    id: "lead-generation",
                    name: "Lead Generation & Qualification",
                    description: "AI-driven lead capture and scoring"
                },
                {
                    id: "campaign-management",
                    name: "Email/SMS Campaign Management",
                    description: "Automated marketing campaigns"
                },
                {
                    id: "voice-ai",
                    name: "Voice AI Agents",
                    description: "32yo Dominican Paul persona voice assistant",
                    persona: "32yo Dominican Paul"
                },
                {
                    id: "process-automation",
                    name: "Business Process Automation",
                    description: "Streamline your business operations"
                },
                {
                    id: "crm-integration",
                    name: "CRM Integration & Management",
                    description: "Connect and optimize your CRM"
                }
            ]
        },

        // Digital Services
        digitalServices: {
            name: "Digital Services",
            icon: "fa-code",
            products: [
                {
                    id: "website-development",
                    name: "Website Development",
                    description: "Custom website design and development"
                },
                {
                    id: "software-development",
                    name: "Software Development",
                    description: "Custom software solutions"
                },
                {
                    id: "web-development",
                    name: "Web Development",
                    description: "Full-stack web applications"
                },
                {
                    id: "creative-services",
                    name: "Creative Services",
                    description: "Design, video, and content creation"
                },
                {
                    id: "brand-development",
                    name: "Brand Development",
                    description: "Complete brand identity creation"
                }
            ]
        },

        // Tech Infrastructure
        techInfrastructure: {
            name: "Tech Infrastructure",
            icon: "fa-server",
            products: [
                {
                    id: "custom-crm",
                    name: "Custom CRM (Base44 Integration)",
                    description: "Tailored CRM solutions"
                },
                {
                    id: "intake-platform",
                    name: "Client Intake Platform",
                    description: "Streamlined client onboarding"
                },
                {
                    id: "communication-hub",
                    name: "Multi-channel Communication Hub",
                    description: "Unified communication management"
                },
                {
                    id: "quote-engine",
                    name: "AI-Powered Quote Engine",
                    description: "Instant intelligent quoting"
                }
            ]
        }
    },

    // Future SaaS Products (In Development)
    futureSaaS: {
        agentHub: {
            id: "agent-hub",
            name: "FLO FACTION AGENT HUB",
            platform: "Base44",
            icon: "fa-users-cog",
            status: "in-development",
            features: [
                "Unified CRM for insurance agents",
                "Integrates: HubSpot, Slack, WhatsApp",
                "Lead tracking & management",
                "Policy management system",
                "Automated follow-up sequences",
                "Real-time analytics dashboard"
            ]
        },
        aiAssistant: {
            id: "ai-assistant",
            name: "FLO FACTION AI ASSISTANT PLATFORM",
            icon: "fa-brain",
            status: "in-development",
            features: [
                "Deploy custom AI voice agents",
                "Multi-persona support",
                "Hive mind framework (agents share knowledge)",
                "Natural language understanding",
                "Integration with phone systems (Google Voice)",
                "Customer service automation"
            ]
        },
        intakeEngine: {
            id: "intake-engine",
            name: "FLO FACTION INTAKE ENGINE",
            icon: "fa-clipboard-list",
            status: "in-development",
            features: [
                "Multi-step form builder",
                "AI-powered data validation",
                "SSN encryption & security",
                "File upload & document management",
                "Email notification system",
                "Customizable workflows"
            ]
        },
        omnichannelSuite: {
            id: "omnichannel-suite",
            name: "FLO FACTION OMNICHANNEL SUITE",
            icon: "fa-comments",
            status: "in-development",
            channels: [
                { name: "Email", description: "SMTP integration" },
                { name: "SMS", description: "Google Voice 772-208-9646" },
                { name: "WhatsApp", description: "flofactionllc@gmail.com" },
                { name: "Slack", description: "Workspace integration" }
            ],
            features: [
                "Unified inbox",
                "AI-powered responses"
            ]
        },
        analyticsPlatform: {
            id: "analytics-platform",
            name: "FLO FACTION ANALYTICS PLATFORM",
            icon: "fa-chart-bar",
            status: "in-development",
            features: [
                "Real-time business metrics",
                "Lead conversion tracking",
                "Revenue forecasting",
                "Performance dashboards",
                "Competitor analysis tools"
            ]
        }
    },

    // Tech Stack & Infrastructure
    techStack: {
        websites: [
            { url: "www.flofaction.com", type: "Main" },
            { url: "www.flofaction.insurance", type: "Insurance" },
            { url: "www.hriinsurance.com", type: "HRI Insurance" }
        ],
        hosting: {
            primary: "Vercel",
            projectId: "prj_377CDUNHHA1SciTQaM10j4up9bYX",
            github: "Flofactionllc",
            replit: "@itsreallyluap"
        },
        repositories: [
            "Flofactionllc/flofaction-website",
            "Flofactionllc/flofaction-portfolio",
            "Flofactionllc/UnifiedAI",
            "Flofactionllc/flofaction-website-backup",
            "Flofactionllc/SimpleWebApi",
            "Flofactionllc/flofaction-ai",
            "Flofactionllc/flo-faction-intake-platform"
        ],
        apis: {
            firebase: { id: "flofaction-website-44132480", configured: true },
            gemini: { configured: true },
            openai: { configured: true },
            resend: { configured: true, purpose: "Email" },
            stripe: { configured: true, purpose: "Payments" },
            qualifire: { configured: true },
            dashscope: { configured: false, note: "To be added" },
            googleAnalytics: { configured: true },
            manychat: { configured: true, purpose: "Multi-channel Chatbot Automation", channels: ["Facebook Messenger", "Instagram", "WhatsApp", "SMS"] }
        },
        email: {
            hri: { smtp: true, variables: ["SMTP_HOST_HRI", "SMTP_PORT_HRI", "SMTP_USER_HRI", "SMTP_PASS_HRI"] },
            insurance: { smtp: true, variables: ["SMTP_HOST_INSURANCE", "SMTP_PORT_INSURANCE", "SMTP_PASS_INSURANCE"] },
            business: { smtp: true, variables: ["SMTP_HOST_BUSINESS", "SMTP_PORT_BUSINESS", "SMTP_USER_BUSINESS", "SMTP_PASS_BUSINESS"] },
            resend: { purpose: "Transactional emails" }
        },
        communication: {
            googleVoice: { number: "772-208-9646", account: "flofactionllc@gmail.com" },
            whatsapp: { account: "flofactionllc@gmail.com" },
            slack: { status: "ready" },
            hubspot: { status: "integration ready" },
            manychat: { status: "configured", channels: ["Messenger", "Instagram", "WhatsApp", "SMS"] }
        },
        crm: {
            primary: "Custom CRM (Base44 'Flo Faction Agent Hub')",
            integrations: ["HubSpot", "Google Sheets (temporary)", "Firebase"]
        }
    },

    // MCP Servers for Maximum Automation
    mcpServers: {
        recommended: [
            {
                id: "gmail",
                package: "@modelcontextprotocol/server-gmail",
                purpose: "Direct Gmail integration",
                benefits: ["Read, send, search emails programmatically"],
                useCase: "Automate email responses, lead extraction"
            },
            {
                id: "google-drive",
                package: "@modelcontextprotocol/server-google-drive",
                purpose: "File management automation",
                benefits: ["Upload/download client documents"],
                useCase: "Policy storage, document retrieval"
            },
            {
                id: "slack",
                package: "@modelcontextprotocol/server-slack",
                purpose: "Team communication automation",
                benefits: ["Auto-notify team, create channels"],
                useCase: "Lead alerts, status updates"
            },
            {
                id: "hubspot",
                package: "@modelcontextprotocol/server-hubspot",
                purpose: "CRM automation",
                benefits: ["Create contacts, update deals"],
                useCase: "Sync leads, track pipeline"
            },
            {
                id: "github",
                package: "@modelcontextprotocol/server-github",
                purpose: "Code repository management",
                benefits: ["Push code, create issues, deploy"],
                useCase: "Automated deployments, version control"
            },
            {
                id: "postgres",
                package: "@modelcontextprotocol/server-postgres",
                purpose: "Database operations",
                benefits: ["Direct DB queries and updates"],
                useCase: "Lead storage, analytics"
            },
            {
                id: "filesystem",
                package: "@modelcontextprotocol/server-filesystem",
                purpose: "Local file operations",
                benefits: ["Read/write files"],
                useCase: "Config management, log analysis"
            },
            {
                id: "brave-search",
                package: "@modelcontextprotocol/server-brave-search",
                purpose: "Web search capability",
                benefits: ["Research, competitor analysis"],
                useCase: "Market intelligence gathering"
            },
            {
                id: "puppeteer",
                package: "@modelcontextprotocol/server-puppeteer",
                purpose: "Browser automation",
                benefits: ["Scrape data, test websites"],
                useCase: "Lead generation, testing"
            },
            {
                id: "sequential-thinking",
                package: "@modelcontextprotocol/server-sequential-thinking",
                purpose: "Enhanced reasoning",
                benefits: ["Complex problem solving"],
                useCase: "Multi-step automation planning"
            }
        ],
        custom: [
            {
                id: "whatsapp",
                name: "Custom WhatsApp MCP Server",
                purpose: "WhatsApp Business API",
                benefits: ["Send/receive WhatsApp messages"],
                useCase: "Client communication automation"
            },
            {
                id: "stripe",
                name: "Custom Stripe MCP Server",
                purpose: "Payment processing",
                benefits: ["Handle transactions"],
                useCase: "Billing automation"
            },
            {
                id: "twilio-voice",
                name: "Custom Twilio/Google Voice MCP",
                purpose: "SMS/Voice automation",
                benefits: ["Automated calling/texting"],
                useCase: "Lead follow-up, reminders"
            },
            {
                id: "zapier",
                name: "Custom Zapier MCP Server",
                purpose: "Connect 5000+ apps",
                benefits: ["Universal integration"],
                useCase: "Workflow automation"
            }
        ]
    },

    // Competitive Analysis & Positioning
    competitiveAnalysis: {
        topAICompanies: [
            {
                name: "OpenAI",
                strength: "Cutting-edge AI models",
                learn: "API-first approach, developer docs",
                apply: "Build comprehensive API documentation"
            },
            {
                name: "Anthropic (Claude)",
                strength: "Safety, reliability",
                learn: "Ethical AI, transparency",
                apply: "Emphasize data privacy, security"
            },
            {
                name: "Perplexity AI",
                strength: "Search + AI integration",
                learn: "Clean UI, citation system",
                apply: "Source transparency in quotes"
            },
            {
                name: "Jasper AI",
                strength: "Marketing focus",
                learn: "Industry-specific solutions",
                apply: "Insurance-specific AI tools"
            },
            {
                name: "Copy.ai",
                strength: "Simplicity, ease of use",
                learn: "Onboarding, templates",
                apply: "Pre-built insurance workflows"
            }
        ],
        differentiation: [
            "AI + Human expertise (insurance licensed agents)",
            "Industry-specific (insurance, finance)",
            "End-to-end solution (not just AI chat)",
            "White-glove service with automation",
            "Regulatory compliant (HIPAA, state insurance)"
        ]
    },

    // Consumer Packaging - Service Tiers
    serviceTiers: {
        essentials: {
            id: "essentials",
            name: "FLO FACTION ESSENTIALS",
            icon: "fa-gem",
            tier: 1,
            price: "Entry-level",
            color: "#667eea",
            features: [
                "Basic insurance quotes",
                "Email support",
                "Standard processing"
            ]
        },
        premium: {
            id: "premium",
            name: "FLO FACTION PREMIUM",
            icon: "fa-star",
            tier: 2,
            price: "Mid-tier",
            color: "#764ba2",
            popular: true,
            features: [
                "AI-powered instant quotes",
                "Priority support (AI + human)",
                "WhatsApp/SMS communication",
                "Personalized recommendations"
            ]
        },
        elite: {
            id: "elite",
            name: "FLO FACTION ELITE",
            icon: "fa-crown",
            tier: 3,
            price: "Premium",
            color: "#f093fb",
            features: [
                "Dedicated AI agent (named)",
                "24/7 support all channels",
                "Financial planning included",
                "Wealth management access",
                "Concierge service"
            ]
        },
        enterprise: {
            id: "enterprise",
            name: "FLO FACTION ENTERPRISE",
            icon: "fa-building",
            tier: 4,
            price: "Custom",
            color: "#00d4ff",
            features: [
                "Full SaaS platform access",
                "Custom AI agent deployment",
                "API access",
                "White-label options",
                "Priority support"
            ]
        }
    },

    // Critical Links & Access
    links: {
        website: "https://www.flofaction.com",
        github: "https://github.com/Flofactionllc",
        vercel: "https://vercel.com/paul-edwards-projects-e56b5ece",
        replitIntake: "https://flo-faction--itsreallyluap.replit.app",
        forAgentsOnly: "https://www.foragentsonly.com/home/?Welcome=91"
    },

    // Action Items for Next Agent
    actionItems: [
        "Install & configure all recommended MCP servers",
        "Build WhatsApp Business integration",
        "Complete Base44 CRM development",
        "Deploy voice AI agents with hive mind",
        "Create consumer-facing tier packages",
        "Develop API documentation",
        "Build competitor tracking dashboard",
        "Complete website homepage overhaul",
        "Integrate intake form with all systems",
        "Set up automated drip campaigns"
    ],

    // Metadata
    metadata: {
        version: "1.0.0",
        lastUpdated: "Jan 9, 2026",
        originalCreated: "Jan 3, 2026",
        timeZone: "EST"
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloFactionConfig;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.FloFactionConfig = FloFactionConfig;
}
