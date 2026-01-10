/**
 * FLO FACTION COMPREHENSIVE KNOWLEDGE BASE
 * Complete business intelligence for autonomous AI agents
 *
 * @version 2.0.0
 * @author Flo Faction LLC
 */

// ============================================
// COMPANY OVERVIEW
// ============================================
const COMPANY = {
    name: 'Flo Faction LLC',
    dba: ['HRI Insurance', 'Flo Faction Insurance', 'CryptK Beats', 'Luap Music'],
    owner: 'Paul Edwards',
    founded: 2020,
    location: 'Stuart, FL',
    phone: '772-208-9646',
    tollFree: '888-255-1191',
    emails: {
        main: 'flofactionllc@gmail.com',
        insurance: 'flofaction.insurance@gmail.com',
        business: 'flofaction.business@gmail.com',
        hri: 'paul@hriinsurance.com',
        producer: 'sandra.insurancebroker28@gmail.com'
    },
    website: 'www.flofaction.com',
    mission: 'Empowering families and businesses with comprehensive protection, wealth-building strategies, and creative solutions.',
    vision: 'To be the trusted partner for insurance, financial wellness, and creative services.'
};

// ============================================
// SERVICE DIVISIONS
// ============================================
const DIVISIONS = {
    hriInsurance: {
        name: 'HRI Insurance',
        focus: 'Property & Casualty',
        products: ['Auto', 'Home', 'Renters', 'Landlord', 'Umbrella', 'Commercial'],
        email: 'paul@hriinsurance.com'
    },
    floFactionInsurance: {
        name: 'Flo Faction Insurance',
        focus: 'Life, Health & Medicare',
        products: ['Term Life', 'Whole Life', 'IUL', 'Health', 'Medicare', 'Disability', 'Final Expense'],
        email: 'flofaction.insurance@gmail.com'
    },
    wealthManagement: {
        name: 'Wealth Management',
        focus: 'Financial Planning & Wealth Building',
        products: ['IUL', 'Annuities', 'Retirement Planning', 'Legacy Planning'],
        strategies: ['Dynasty Strategy', 'Waterfall Method', 'Rockefeller Method'],
        email: 'flofaction.insurance@gmail.com'
    },
    creativeServices: {
        name: 'Creative & Media Services',
        focus: 'Music, Video, Photography',
        services: ['Beat Production', 'Audio Recording', 'Video Production', 'Photography', 'Executive Production'],
        email: 'flofaction.business@gmail.com'
    },
    consulting: {
        name: 'Financial Consulting',
        focus: 'Personal & Business Finance',
        services: ['Personal Finance Coaching', 'Business Financial Consulting', 'Tax Strategy', 'Debt Management'],
        email: 'flofaction.business@gmail.com'
    },
    digital: {
        name: 'Digital Services',
        focus: 'Technology & Automation',
        services: ['Web Development', 'AI Automation', 'CRM Integration', 'Marketing'],
        email: 'flofaction.business@gmail.com'
    }
};

// ============================================
// INSURANCE CARRIERS & PRODUCTS
// ============================================
const INSURANCE_CARRIERS = {
    // Life Insurance Carriers
    life: {
        foresters: {
            name: 'Foresters Financial',
            producerNumber: '888894',
            products: ['Term Life', 'Whole Life', 'Final Expense'],
            strengths: ['Fraternal benefits', 'Community giving', 'Member benefits'],
            bestFor: ['Families wanting community connection', 'Budget-conscious buyers'],
            phone: null,
            portal: 'myezbiz.foresters.com'
        },
        mutualOfOmaha: {
            name: 'Mutual of Omaha',
            products: ['Term Life', 'Whole Life', 'Universal Life', 'Final Expense', 'Medicare Supplements'],
            strengths: ['Strong ratings', 'Simplified underwriting', 'Quick issue'],
            bestFor: ['Seniors', 'Final expense needs', 'Quick coverage'],
            phone: '800-867-6873',
            portal: 'mutualofomaha.com'
        },
        americo: {
            name: 'Americo',
            products: ['Term Life', 'Whole Life', 'Final Expense', 'Annuities'],
            strengths: ['Competitive rates', 'Flexible underwriting'],
            bestFor: ['Budget buyers', 'Simplified issue needs'],
            phone: '800-231-0801'
        },
        johnHancock: {
            name: 'John Hancock',
            products: ['Term Life', 'Universal Life', 'Variable Life', 'Long-Term Care'],
            strengths: ['Vitality program', 'Strong brand', 'Innovation'],
            bestFor: ['Health-conscious clients', 'Tech-savvy buyers'],
            portal: 'jhsaleshub.com'
        },
        prudential: {
            name: 'Prudential',
            products: ['Term Life', 'Universal Life', 'Variable Life'],
            strengths: ['Financial strength', 'Wide product range'],
            bestFor: ['High net worth clients', 'Complex needs'],
            portal: 'prudentialexpresslife.prudential.com'
        },
        protective: {
            name: 'Protective Life',
            products: ['Term Life', 'Universal Life', 'Indexed UL'],
            strengths: ['Competitive IUL', 'Strong living benefits'],
            bestFor: ['IUL buyers', 'Wealth building focus']
        },
        nationwide: {
            name: 'Nationwide',
            products: ['Term Life', 'Whole Life', 'Universal Life', 'Annuities'],
            strengths: ['Brand recognition', 'Multi-line discounts'],
            bestFor: ['Bundling with P&C', 'Brand-loyal clients'],
            portal: 'nationwidefinancial.com'
        },
        massMutual: {
            name: 'MassMutual',
            agentId: '853518',
            products: ['Whole Life', 'Term Life', 'Universal Life', 'Disability'],
            strengths: ['Dividends', 'Mutual company', 'Financial strength'],
            bestFor: ['Dividend-seeking clients', 'Long-term planning']
        },
        americanNational: {
            name: 'American National',
            producerCode: 'F11K1',
            products: ['Term Life', 'Whole Life', 'Universal Life', 'Annuities'],
            strengths: ['Competitive rates', 'Flexible products'],
            bestFor: ['Price-sensitive buyers'],
            phone: null
        },
        allianz: {
            name: 'Allianz Life',
            products: ['Fixed Indexed Annuities', 'Variable Annuities', 'Life Insurance'],
            strengths: ['Strong annuity products', 'Index options'],
            bestFor: ['Retirement income', 'Safe money strategies'],
            portal: 'allianzlife.com'
        },
        ameritas: {
            name: 'Ameritas',
            agencyNumber: 'en00007034',
            agentNumber: 'AG00283925',
            products: ['Term Life', 'Whole Life', 'Dental', 'Vision'],
            strengths: ['Dental/vision combo', 'Employee benefits'],
            bestFor: ['Group benefits', 'Dental/vision needs'],
            portal: 'service.ameritas.com'
        },
        corebridge: {
            name: 'Corebridge Financial (AIG)',
            products: ['Life Insurance', 'Annuities', 'Retirement'],
            strengths: ['Former AIG strength', 'Diverse products'],
            bestFor: ['Retirement planning', 'Annuity needs']
        },
        ethos: {
            name: 'Ethos',
            products: ['Term Life (simplified)'],
            strengths: ['Quick online quotes', 'No medical exam options'],
            bestFor: ['Quick coverage', 'Tech-savvy buyers']
        },
        americanAmicable: {
            name: 'American Amicable',
            products: ['Final Expense', 'Term Life'],
            strengths: ['Simplified underwriting', 'Graded benefits'],
            bestFor: ['Hard-to-insure clients', 'Final expense']
        },
        fAndG: {
            name: 'F&G (Fidelity & Guaranty)',
            products: ['Annuities', 'Life Insurance'],
            strengths: ['Strong annuity products'],
            bestFor: ['Retirement income', 'Safe money'],
            phone: '800-445-6758'
        },
        guardian: {
            name: 'Guardian',
            products: ['Whole Life', 'Disability', 'Dental'],
            strengths: ['Disability income', 'Employee benefits'],
            bestFor: ['Professionals', 'Disability needs'],
            portal: 'guardianlife.com'
        }
    },

    // Health Insurance Carriers
    health: {
        uhc: {
            name: 'UnitedHealthcare (UHC)',
            products: ['ACA Plans', 'Short-term', 'Medicare Advantage', 'Supplements'],
            strengths: ['Largest network', 'Brand recognition', 'Medicare strength'],
            bestFor: ['Network access priority', 'Medicare clients'],
            portal: 'jarvys.com'
        },
        aetna: {
            name: 'Aetna',
            products: ['ACA Plans', 'Medicare Advantage', 'Supplements', 'Dental'],
            strengths: ['CVS integration', 'Strong Medicare'],
            bestFor: ['Pharmacy needs', 'Medicare clients'],
            phone: '866-272-6630',
            portal: 'producerworld.com'
        },
        cigna: {
            name: 'Cigna',
            writingId: '664357',
            products: ['ACA Plans', 'Medicare', 'Dental', 'Supplemental'],
            strengths: ['Global coverage', 'Dental strength'],
            bestFor: ['Dental needs', 'International coverage']
        },
        healthSherpa: {
            name: 'HealthSherpa',
            type: 'Marketplace Platform',
            products: ['ACA Marketplace Plans'],
            strengths: ['Easy enrollment', 'Multi-carrier access'],
            bestFor: ['ACA shopping', 'Subsidy qualification']
        },
        thinkAgent: {
            name: 'ThinkAgent',
            type: 'Quoting Platform',
            products: ['Multi-carrier quotes'],
            strengths: ['Quick quotes', 'Comparison tool'],
            portal: 'app.thinkagent.com'
        },
        compassHealth: {
            name: 'Compass Health',
            type: 'CRM/Platform',
            products: ['Lead management', 'Policy tracking'],
            portal: 'apps.topbrokercrm.com'
        }
    },

    // Aggregators & IMOs
    aggregators: {
        crump: {
            name: 'Crump Life Insurance Services',
            crumpId: '30037542',
            type: 'IMO/FMO',
            services: ['Life contracting', 'Case support', 'Advanced markets'],
            portal: 'crump.com'
        },
        ffl: {
            name: 'Family First Life',
            type: 'IMO',
            focus: 'Life insurance distribution',
            portal: 'ww3.familyfirstlife.com'
        },
        hcms: {
            name: 'HCMS',
            type: 'Platform',
            services: ['Health insurance platform'],
            portal: 'hcms portal'
        },
        nlg: {
            name: 'NLG (National Life Group)',
            type: 'Carrier/IMO',
            products: ['Life', 'Annuities'],
            strengths: ['Living benefits', 'IUL products']
        }
    }
};

// ============================================
// WEALTH BUILDING STRATEGIES
// ============================================
const WEALTH_STRATEGIES = {
    dynasty: {
        name: 'Dynasty Strategy',
        type: 'Generational Wealth Transfer',
        description: 'Build and transfer wealth across multiple generations using permanent life insurance.',
        howItWorks: [
            'Purchase permanent life insurance (Whole Life or IUL)',
            'Cash value grows tax-deferred over time',
            'Death benefit passes to heirs tax-free',
            'Can be structured in irrevocable trust for estate tax benefits',
            'Heirs can continue the strategy for their children'
        ],
        benefits: [
            'Tax-free death benefit',
            'Tax-deferred cash value growth',
            'Asset protection in many states',
            'Bypasses probate',
            'Creates multi-generational wealth'
        ],
        idealFor: [
            'Families wanting to leave a legacy',
            'High net worth individuals',
            'Business owners',
            'Those concerned about estate taxes'
        ],
        products: ['Whole Life', 'IUL', 'Survivorship policies'],
        objectionHandling: {
            'too expensive': 'The cost is an investment in your family\'s future. Let\'s look at what fits your budget.',
            'not sure': 'I understand. Most people don\'t realize how powerful this strategy is. Let me show you a real example.',
            'can\'t afford': 'We can start smaller and increase later. Even a modest policy can grow significantly.'
        }
    },

    waterfall: {
        name: 'Waterfall Method',
        type: 'Tax-Free Retirement Income',
        description: 'Use IUL policy loans to create tax-free retirement income stream.',
        howItWorks: [
            'Fund an Indexed Universal Life (IUL) policy during working years',
            'Cash value grows tied to market indexes with downside protection',
            'At retirement, take policy loans (not withdrawals)',
            'Loans are not taxable income',
            'Repay loans from death benefit at end of life',
            'Money "waterfalls" through the policy continuously'
        ],
        benefits: [
            'Tax-free retirement income',
            'Market upside with downside protection',
            'No required minimum distributions',
            'Death benefit for family',
            'Flexibility in contributions'
        ],
        idealFor: [
            'Maxed out 401k contributors',
            'Those in high tax brackets',
            'People wanting tax diversification',
            'Self-employed individuals'
        ],
        products: ['Indexed Universal Life (IUL)'],
        objectionHandling: {
            'sounds too good': 'It\'s legitimate tax code. The IRS allows policy loans. Banks and corporations use this exact strategy.',
            'what about fees': 'Yes, there are costs. But the tax savings often far exceed the fees. Let me show you the math.',
            'market risk': 'Unlike direct market investments, IUL has a floor - you won\'t lose money in down markets.'
        }
    },

    rockefeller: {
        name: 'Rockefeller Method',
        type: 'Infinite Banking / Be Your Own Bank',
        description: 'Use whole life insurance cash value as your personal banking system.',
        howItWorks: [
            'Purchase dividend-paying whole life insurance',
            'Build cash value over time',
            'Borrow against your policy instead of going to banks',
            'Pay yourself back with interest',
            'Your money continues to grow even while borrowed',
            'Use for major purchases, investments, emergencies'
        ],
        benefits: [
            'You control your money, not banks',
            'Interest paid goes back to you',
            'Uninterrupted compounding',
            'Asset protection',
            'Death benefit for family'
        ],
        idealFor: [
            'Business owners needing capital',
            'Real estate investors',
            'Those tired of paying bank interest',
            'Savers wanting better returns than CDs'
        ],
        products: ['Dividend-paying Whole Life'],
        objectionHandling: {
            'why not just save': 'Savings accounts pay almost nothing. This grows faster and has a death benefit.',
            'seems complicated': 'The concept is simple: it\'s YOUR bank. I\'ll walk you through it step by step.',
            'I have investments': 'Great! This complements investments by providing a guaranteed, stable foundation.'
        }
    }
};

// ============================================
// CREATIVE SERVICES (MUSIC, VIDEO, PHOTO)
// ============================================
const CREATIVE_SERVICES = {
    music: {
        beatProduction: {
            name: 'Beat Production & Licensing',
            brands: ['CryptK Beats', 'Luap Beats', 'Luapiano Beats'],
            genres: ['Hip Hop', 'R&B', 'Trap', 'Pop', 'Gospel', 'Jazz', 'Lo-Fi'],
            pricing: {
                mp3Lease: { price: 29.99, includes: ['MP3 file', 'Non-exclusive'] },
                wavLease: { price: 49.99, includes: ['WAV file', 'MP3', 'Non-exclusive'] },
                trackoutLease: { price: 99.99, includes: ['Stems', 'WAV', 'MP3', 'Non-exclusive'] },
                unlimited: { price: 199.99, includes: ['All files', 'Unlimited streams', 'Radio/TV'] },
                exclusive: { price: 499, includes: ['Full ownership', 'All files', 'Copyright transfer'], note: 'Starting price - varies by beat' }
            },
            services: [
                'Custom beat production',
                'Beat licensing',
                'Sample packs',
                'Loop kits'
            ]
        },
        audioRecording: {
            name: 'Audio Recording & Engineering',
            services: [
                'Vocal recording',
                'Instrument recording',
                'Mixing',
                'Mastering',
                'Podcast production',
                'Voiceover recording'
            ],
            options: {
                studio: {
                    name: 'Studio Session',
                    description: 'Recording at our professional studio',
                    pricing: 'Hourly rates available'
                },
                mobile: {
                    name: 'Mobile Recording',
                    description: 'We come to your location with professional equipment',
                    pricing: 'Travel fees may apply',
                    coverage: 'Treasure Coast FL and surrounding areas'
                },
                consignment: {
                    name: 'Studio Consignment',
                    description: 'Partner with other studios for your project',
                    pricing: 'Project-based pricing'
                }
            }
        },
        executiveProduction: {
            name: 'Executive Production',
            description: 'Full project oversight from concept to completion',
            services: [
                'Artist development',
                'Album/EP production',
                'Beat selection and curation',
                'Session coordination',
                'Mix and master oversight',
                'Distribution guidance'
            ],
            pricing: 'Project-based - contact for quote'
        }
    },

    video: {
        name: 'Video Production',
        services: [
            'Music videos',
            'Promotional videos',
            'Corporate videos',
            'Social media content',
            'Event coverage',
            'Interviews and documentaries'
        ],
        packages: {
            basic: {
                name: 'Basic Video Package',
                includes: ['1-2 hour shoot', 'Basic editing', '1 revision'],
                pricing: 'Starting at $500'
            },
            professional: {
                name: 'Professional Package',
                includes: ['Half-day shoot', 'Professional editing', 'Color grading', '2 revisions'],
                pricing: 'Starting at $1,500'
            },
            premium: {
                name: 'Premium Package',
                includes: ['Full-day shoot', 'Advanced editing', 'Motion graphics', 'Unlimited revisions'],
                pricing: 'Starting at $3,000'
            }
        }
    },

    photography: {
        name: 'Photography Services',
        services: [
            'Portrait photography',
            'Event photography',
            'Product photography',
            'Real estate photography',
            'Headshots',
            'Album artwork'
        ],
        pricing: 'Session-based pricing - contact for quote'
    }
};

// ============================================
// FINANCIAL CONSULTING
// ============================================
const CONSULTING_SERVICES = {
    personal: {
        name: 'Personal Finance Consulting',
        services: [
            'Budget creation and management',
            'Debt elimination strategies',
            'Credit repair guidance',
            'Savings plans',
            'Investment education',
            'Retirement planning basics'
        ],
        includes: [
            'Initial consultation',
            'Personalized action plan',
            'Follow-up sessions',
            'Resource materials'
        ],
        pricing: 'Affordable hourly rates'
    },

    business: {
        name: 'Business Financial Consulting',
        services: [
            'Business financial analysis',
            'Cash flow management',
            'Tax strategy planning',
            'Business structure optimization',
            'Funding and capital strategies',
            'Exit planning'
        ],
        includes: [
            'Comprehensive assessment',
            'Strategic recommendations',
            'Implementation support',
            'Full disclosures and documentation',
            'Contracts and consent forms',
            'Ongoing advisory (optional)'
        ],
        pricing: 'Premium pricing - contact for quote',
        note: 'Business consulting is more comprehensive and priced higher than personal consulting'
    }
};

// ============================================
// SALES STRATEGIES (INSPIRED BY INDUSTRY LEADERS)
// ============================================
const SALES_STRATEGIES = {
    needsBasedSelling: {
        name: 'Needs-Based Selling',
        principle: 'Recommend products based on client needs, not what we prefer to sell',
        steps: [
            'Ask discovery questions to understand their situation',
            'Identify pain points and goals',
            'Match products to their specific needs',
            'Present options, not just one product',
            'Let them choose what fits best'
        ]
    },

    consultativeApproach: {
        name: 'Consultative Selling',
        principle: 'Position yourself as an advisor, not a salesperson',
        steps: [
            'Educate before selling',
            'Provide value in every interaction',
            'Build trust through knowledge',
            'Make recommendations like a trusted advisor',
            'Follow up with ongoing education'
        ]
    },

    kaboomMethod: {
        name: 'High-Volume Lead Generation',
        principle: 'Generate massive lead flow and qualify efficiently',
        tactics: [
            'Multi-channel lead generation (social, paid, referrals)',
            'Quick qualification to focus on hot leads',
            'Systematic follow-up sequences',
            'Speed to lead - contact within 5 minutes',
            'Track metrics and optimize continuously'
        ]
    },

    objectionHandling: {
        'I need to think about it': [
            'Absolutely! What specifically would you like to think about?',
            'Is it the coverage, the price, or something else?',
            'While you think, what if something happened tomorrow?'
        ],
        'It\'s too expensive': [
            'I understand budget is important. Let\'s look at what you CAN afford.',
            'What if we could find a plan within your budget?',
            'Consider the cost of NOT having coverage...'
        ],
        'I need to talk to my spouse': [
            'Great idea! When can we schedule a call with both of you?',
            'What questions do you think they\'ll have?',
            'Would it help if I prepared a summary for them?'
        ],
        'I\'m not interested': [
            'No problem! Just curious - do you currently have coverage?',
            'Is there a better time to discuss this?',
            'What would make you interested?'
        ],
        'Send me information': [
            'I\'d be happy to! What\'s the best email? Also, when should I follow up?',
            'Absolutely. Most people have questions after reviewing - when should I call?',
            'Sure! Just so I send relevant info, what\'s your main concern?'
        ]
    },

    closingTechniques: {
        assumptive: 'So should we start with the $500,000 or $1,000,000 policy?',
        urgency: 'Today\'s rates are locked in - if we wait, they could go up.',
        alternative: 'Would you prefer to pay monthly or annually?',
        summary: 'So we\'re looking at full protection for your family, tax-free growth, and retirement income. Ready to get started?',
        emotional: 'Think about your family\'s peace of mind knowing they\'re protected. Isn\'t that worth it?'
    }
};

// ============================================
// PRODUCT MATCHING ENGINE
// ============================================
function matchProductToClient(clientProfile) {
    const recommendations = [];

    // Age-based recommendations
    if (clientProfile.age >= 60 || clientProfile.turningMedicare) {
        recommendations.push({
            product: 'Medicare',
            carrier: 'UHC or Aetna',
            reason: 'Age-appropriate coverage',
            priority: 'high'
        });
    }

    // Family situation
    if (clientProfile.hasFamily || clientProfile.hasDependents) {
        recommendations.push({
            product: 'Life Insurance',
            carrier: 'Depends on health and budget',
            reason: 'Family protection',
            priority: 'high'
        });
    }

    // Wealth building interest
    if (clientProfile.interestedInWealth || clientProfile.highIncome) {
        recommendations.push({
            product: 'IUL with Waterfall Strategy',
            carrier: 'Protective or Nationwide',
            reason: 'Tax-advantaged wealth building',
            priority: 'high'
        });
    }

    // Property needs
    if (clientProfile.ownsHome) {
        recommendations.push({
            product: 'Home Insurance',
            carrier: 'Shop multiple',
            reason: 'Property protection',
            priority: 'medium'
        });
    }

    if (clientProfile.ownsCar) {
        recommendations.push({
            product: 'Auto Insurance',
            carrier: 'Shop multiple',
            reason: 'Vehicle protection',
            priority: 'medium'
        });
    }

    // Business needs
    if (clientProfile.isBusinessOwner) {
        recommendations.push({
            product: 'Business Consulting + Key Person Insurance',
            reason: 'Business protection and growth',
            priority: 'high'
        });
    }

    // Creative needs
    if (clientProfile.isArtist || clientProfile.needsMusic) {
        recommendations.push({
            product: 'Music Production Services',
            reason: 'Creative needs',
            priority: 'medium'
        });
    }

    return recommendations;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    COMPANY,
    DIVISIONS,
    INSURANCE_CARRIERS,
    WEALTH_STRATEGIES,
    CREATIVE_SERVICES,
    CONSULTING_SERVICES,
    SALES_STRATEGIES,
    matchProductToClient
};
