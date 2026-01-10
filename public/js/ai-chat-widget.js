/**
 * FLO FACTION AUTONOMOUS AI CHAT WIDGET
 * Self-operating customer engagement and booking agent
 *
 * @version 2.0.0
 * @author Flo Faction LLC
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        company: 'Flo Faction',
        phone: '772-208-9646',
        email: 'flofaction.insurance@gmail.com',
        website: 'www.flofaction.com',
        intakeUrl: '/intake.html',
        calendarUrl: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3z9jPLqPQqPQ',

        // Agent behavior settings
        autoGreet: true,
        greetDelay: 3000, // 3 seconds after page load
        idlePromptDelay: 30000, // 30 seconds of inactivity
        typingSpeed: 30, // ms per character

        // Appearance
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',

        // ElevenLabs Voice Agent ID (if available)
        voiceAgentId: 'agent_2401kcafh68jer4s67d2d3y37mcv'
    };

    // ============================================
    // KNOWLEDGE BASE
    // ============================================
    const KNOWLEDGE_BASE = {
        services: {
            auto: {
                name: 'Auto Insurance',
                description: 'Full coverage, liability, collision, and comprehensive auto insurance',
                division: 'HRI Insurance',
                email: 'paul@hriinsurance.com'
            },
            home: {
                name: 'Home Insurance',
                description: 'Homeowners, renters, landlord, and property insurance',
                division: 'HRI Insurance',
                email: 'paul@hriinsurance.com'
            },
            life: {
                name: 'Life Insurance',
                description: 'Term life, whole life, IUL, and final expense coverage',
                division: 'Flo Faction Insurance',
                email: 'flofaction.insurance@gmail.com',
                strategies: ['Dynasty Strategy', 'Waterfall Method']
            },
            health: {
                name: 'Health Insurance',
                description: 'ACA marketplace plans, short-term, dental, and vision coverage',
                division: 'Flo Faction Insurance',
                email: 'flofaction.insurance@gmail.com'
            },
            medicare: {
                name: 'Medicare',
                description: 'Medicare Advantage, Supplement, and Part D plans',
                division: 'Flo Faction Insurance',
                email: 'flofaction.insurance@gmail.com'
            },
            wealth: {
                name: 'Wealth Management',
                description: 'IUL, annuities, retirement planning, and legacy planning',
                division: 'Wealth Management',
                email: 'flofaction.insurance@gmail.com',
                strategies: ['Dynasty Strategy', 'Waterfall Method', 'Rockefeller Method']
            },
            digital: {
                name: 'Digital Services',
                description: 'Web development, AI automation, and marketing',
                division: 'Digital Services',
                email: 'flofaction.business@gmail.com'
            },
            music: {
                name: 'Music & Beats',
                description: 'CryptK Beats, Luap Beats, Luapiano Beats - instrumental licensing',
                division: 'Music Store',
                email: 'flofaction.business@gmail.com'
            }
        },

        strategies: {
            dynasty: {
                name: 'Dynasty Strategy',
                description: 'Build generational wealth through permanent life insurance. Tax-free death benefit, cash value growth, and legacy planning for your family.',
                cta: 'Schedule a Dynasty Strategy consultation'
            },
            waterfall: {
                name: 'Waterfall Method',
                description: 'Use IUL policy loans for tax-free retirement income. Borrow against your cash value, repay yourself, and keep the interest.',
                cta: 'Learn how Waterfall can work for you'
            },
            rockefeller: {
                name: 'Rockefeller Method',
                description: 'Bank like wealthy families. Build cash value, loan from yourself instead of banks, and compound your wealth generation.',
                cta: 'Discover the Rockefeller banking secrets'
            }
        },

        faqs: {
            'what services': 'We offer Auto, Home, Life, Health, and Medicare insurance. We also specialize in wealth building strategies like the Dynasty and Waterfall methods. Plus digital services and music production!',
            'get a quote': 'I\'d love to get you a quote! Fill out our intake form and a specialist will contact you within 24 hours. Or call us directly at 772-208-9646.',
            'book appointment': 'You can schedule a free consultation right now! Click the calendar link or I can help you find a time that works.',
            'contact': 'You can reach us at 772-208-9646, email flofaction.insurance@gmail.com, or fill out our intake form. We respond within 24 business hours.',
            'dynasty': 'The Dynasty Strategy uses permanent life insurance to build and transfer wealth across generations. Tax-free death benefits, cash value growth, and legacy protection. Want to learn more?',
            'waterfall': 'The Waterfall Method lets you use IUL policy loans for tax-free retirement income. You borrow against your policy, repay yourself, and keep the interest. Interested in a consultation?',
            'iul': 'Indexed Universal Life (IUL) is a permanent life insurance policy that builds cash value tied to market indexes. It offers downside protection and tax-advantaged growth. Great for wealth building!',
            'medicare': 'We help with Medicare Advantage, Supplement (Medigap), and Part D plans. Turning 65 soon or already on Medicare? Let\'s review your options!',
            'auto insurance': 'We work with 7+ major carriers to find you the best auto insurance rates. Full coverage, liability, collision - whatever you need. Want a free quote?',
            'life insurance': 'We offer term life for affordable protection, whole life for guarantees, and IUL for wealth building. What\'s your primary goal - protection or wealth building?'
        }
    };

    // ============================================
    // INTENT DETECTION
    // ============================================
    const INTENTS = {
        greeting: {
            patterns: [/^(hi|hello|hey|good morning|good afternoon|good evening)/i],
            response: () => `Hi there! 👋 Welcome to ${CONFIG.company}! I'm your AI assistant. How can I help you today?

I can help you with:
• Insurance quotes (Auto, Home, Life, Health, Medicare)
• Wealth building strategies (Dynasty, Waterfall)
• Scheduling appointments
• Answering questions

What are you interested in?`
        },

        quote: {
            patterns: [/quote|price|cost|how much|rates?/i],
            response: (match, input) => {
                const product = detectProduct(input);
                if (product) {
                    return `Great! I'd love to help you get a ${product} quote.

To provide accurate pricing, I'll need some information. You can:

📋 **Fill out our quick form**: [Get Quote](${CONFIG.intakeUrl}?product=${product.toLowerCase().replace(' ', '-')})

📞 **Call us**: ${CONFIG.phone}

Which would you prefer?`;
                }
                return `I can help you get a quote! What type of insurance are you looking for?

• **Auto Insurance** 🚗
• **Home Insurance** 🏠
• **Life Insurance** ❤️
• **Health Insurance** 🏥
• **Medicare** 👴

Just let me know!`;
            }
        },

        appointment: {
            patterns: [/book|schedule|appointment|meet|call|consultation|talk/i],
            response: () => `I'd be happy to help you schedule a consultation! 📅

**Quick Options:**
• [📅 Book Online](${CONFIG.calendarUrl}) - Pick a time that works for you
• 📞 Call Now: ${CONFIG.phone}
• [📋 Fill Intake Form](${CONFIG.intakeUrl}) - We'll call you back

Our team is available:
Mon-Fri: 9 AM - 6 PM EST
Saturday: 10 AM - 4 PM EST

Would you like me to help you with anything specific before your appointment?`
        },

        dynasty: {
            patterns: [/dynasty|generational|legacy|wealth transfer|inheritance/i],
            response: () => `**The Dynasty Strategy** is one of our most powerful wealth-building approaches! 🏛️

Here's how it works:
✅ Build permanent life insurance with growing cash value
✅ Tax-free death benefit passes to your heirs
✅ Cash value grows tax-deferred
✅ Create a multi-generational wealth engine

Many families use Dynasty to protect AND grow their wealth for generations.

Want to see how it could work for you? [Schedule a Dynasty Consultation](${CONFIG.intakeUrl}?product=dynasty-strategy)`
        },

        waterfall: {
            patterns: [/waterfall|infinite banking|be your own bank|policy loan|tax.?free.*retire/i],
            response: () => `**The Waterfall Method** is how smart money creates tax-free retirement income! 💧

Here's the strategy:
1️⃣ Build cash value in your IUL policy
2️⃣ Borrow against it (tax-free loans!)
3️⃣ Use the money for retirement income
4️⃣ Repay yourself - keep the interest
5️⃣ Policy continues to grow

Result? Retirement income without the tax burden!

Ready to learn more? [Schedule a Waterfall Consultation](${CONFIG.intakeUrl}?product=waterfall-strategy)`
        },

        auto: {
            patterns: [/auto|car|vehicle|motorcycle|rv/i],
            response: () => `**Auto Insurance** - We've got you covered! 🚗

We work with 7+ major carriers to find you:
• Competitive rates
• Full coverage options
• Liability & collision
• Comprehensive protection

Ready for a free quote? Tell me:
• What vehicle(s) do you have?
• Any accidents or tickets in the last 3 years?

Or [Get Your Free Auto Quote](${CONFIG.intakeUrl}?product=auto-insurance) 📋`
        },

        life: {
            patterns: [/life insurance|term|whole life|iul|final expense/i],
            response: () => `**Life Insurance** - Protecting your family's future! ❤️

We offer:
• **Term Life** - Affordable, temporary protection
• **Whole Life** - Guaranteed lifelong coverage
• **IUL** - Protection + wealth building
• **Final Expense** - Peace of mind coverage

What's your primary goal?
1. Protect my family
2. Build wealth for retirement
3. Both

[Start Your Life Insurance Quote](${CONFIG.intakeUrl}?product=life-insurance) 📋`
        },

        health: {
            patterns: [/health insurance|aca|marketplace|medical|prescription/i],
            response: () => `**Health Insurance** - Finding you the right coverage! 🏥

We help with:
• ACA Marketplace plans
• Short-term health insurance
• Dental & Vision
• Supplemental coverage

Important dates:
📅 Open Enrollment: Nov 1 - Jan 15
📅 Special Enrollment: Life events qualify

Is this for yourself, or your whole family?

[Get Health Insurance Options](${CONFIG.intakeUrl}?product=health-insurance) 📋`
        },

        medicare: {
            patterns: [/medicare|65|turning 65|supplement|medigap|part d/i],
            response: () => `**Medicare** - We make it simple! 👴

We help you understand:
• **Medicare Advantage** (Part C)
• **Medicare Supplement** (Medigap)
• **Part D** Prescription coverage

Are you:
1. Turning 65 soon?
2. Already on Medicare?
3. Just researching options?

Let me know and I'll point you in the right direction!

[Schedule Medicare Review](${CONFIG.intakeUrl}?product=medicare) 📋`
        },

        contact: {
            patterns: [/contact|reach|phone|email|call|text/i],
            response: () => `Here's how to reach us! 📞

**Phone:** ${CONFIG.phone}
**Email:** ${CONFIG.email}
**Website:** ${CONFIG.website}

**Quick Links:**
• [📋 Intake Form](${CONFIG.intakeUrl})
• [📅 Book Appointment](${CONFIG.calendarUrl})

**Business Hours:**
Mon-Fri: 9 AM - 6 PM EST
Saturday: 10 AM - 4 PM EST

How can I help you further?`
        },

        music: {
            patterns: [/beat|music|producer|instrumental|cryptk|luap/i],
            response: () => `**Music & Beats** - Check out our catalogs! 🎵

We have:
• **CryptK Beats** - Hard-hitting instrumentals
• **Luap Beats** - Versatile production
• **Luapiano Beats** - Melodic piano-driven beats

Looking to:
1. Browse beats
2. License a track
3. Custom production

Let me know what you're looking for!`
        },

        help: {
            patterns: [/help|what can you do|options|services/i],
            response: () => `I'm here to help! Here's what I can do:

**Insurance:**
🚗 Auto Insurance quotes
🏠 Home Insurance quotes
❤️ Life Insurance & wealth strategies
🏥 Health Insurance options
👴 Medicare guidance

**Wealth Building:**
🏛️ Dynasty Strategy
💧 Waterfall Method
🏦 Rockefeller Method

**Actions:**
📅 Schedule appointments
📋 Start intake process
📞 Connect you with specialists

What interests you most?`
        },

        thanks: {
            patterns: [/thank|thanks|appreciate|helpful/i],
            response: () => `You're welcome! 😊 It's my pleasure to help.

Is there anything else you'd like to know about our services? Or ready to take the next step?

• [📅 Book Consultation](${CONFIG.calendarUrl})
• [📋 Fill Intake Form](${CONFIG.intakeUrl})
• 📞 Call: ${CONFIG.phone}`
        },

        default: {
            patterns: [],
            response: (match, input) => {
                // Check FAQ knowledge base
                for (const [key, answer] of Object.entries(KNOWLEDGE_BASE.faqs)) {
                    if (input.toLowerCase().includes(key)) {
                        return answer + `\n\nWant to [Schedule a Call](${CONFIG.calendarUrl}) to discuss further?`;
                    }
                }

                return `I want to make sure I understand your question correctly. Could you tell me more about what you're looking for?

I can help with:
• **Insurance quotes** - Auto, Home, Life, Health, Medicare
• **Wealth strategies** - Dynasty, Waterfall, IUL
• **Appointments** - Schedule a consultation
• **General info** - About our services

Or call us at ${CONFIG.phone} for immediate assistance! 📞`;
            }
        }
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function detectProduct(input) {
        const text = input.toLowerCase();
        if (text.match(/auto|car|vehicle/)) return 'Auto Insurance';
        if (text.match(/home|house|property/)) return 'Home Insurance';
        if (text.match(/life|iul/)) return 'Life Insurance';
        if (text.match(/health|medical/)) return 'Health Insurance';
        if (text.match(/medicare/)) return 'Medicare';
        return null;
    }

    function detectIntent(input) {
        for (const [name, intent] of Object.entries(INTENTS)) {
            for (const pattern of intent.patterns) {
                const match = input.match(pattern);
                if (match) {
                    return { name, intent, match };
                }
            }
        }
        return { name: 'default', intent: INTENTS.default, match: null };
    }

    function formatMessage(text) {
        // Convert markdown-like syntax to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #667eea;">$1</a>')
            .replace(/\n/g, '<br>');
    }

    // ============================================
    // CHAT WIDGET CLASS
    // ============================================
    class AIChatWidget {
        constructor() {
            this.isOpen = false;
            this.messages = [];
            this.isTyping = false;
            this.lastActivity = Date.now();

            this.injectStyles();
            this.createWidget();
            this.bindEvents();

            if (CONFIG.autoGreet) {
                setTimeout(() => this.showGreeting(), CONFIG.greetDelay);
            }

            // Idle prompt
            setInterval(() => this.checkIdlePrompt(), 10000);
        }

        injectStyles() {
            if (document.getElementById('ff-chat-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'ff-chat-styles';
            styles.textContent = `
                .ff-chat-widget {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 380px;
                    max-width: calc(100vw - 40px);
                    height: 500px;
                    max-height: calc(100vh - 120px);
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    z-index: 9997;
                    transform: translateY(20px);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .ff-chat-widget.open {
                    transform: translateY(0);
                    opacity: 1;
                    visibility: visible;
                }
                .ff-chat-header {
                    background: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, ${CONFIG.secondaryColor} 100%);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 16px 16px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ff-chat-header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .ff-chat-avatar {
                    width: 40px;
                    height: 40px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .ff-chat-header-text h4 {
                    margin: 0;
                    font-size: 16px;
                }
                .ff-chat-header-text span {
                    font-size: 12px;
                    opacity: 0.9;
                }
                .ff-chat-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                }
                .ff-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .ff-chat-message {
                    max-width: 85%;
                    padding: 12px 16px;
                    border-radius: 16px;
                    font-size: 14px;
                    line-height: 1.5;
                    animation: messageIn 0.3s ease;
                }
                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .ff-chat-message.bot {
                    background: #f0f4ff;
                    color: #333;
                    align-self: flex-start;
                    border-bottom-left-radius: 4px;
                }
                .ff-chat-message.user {
                    background: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, ${CONFIG.secondaryColor} 100%);
                    color: white;
                    align-self: flex-end;
                    border-bottom-right-radius: 4px;
                }
                .ff-chat-message a {
                    color: ${CONFIG.primaryColor};
                    text-decoration: underline;
                }
                .ff-chat-message.user a {
                    color: white;
                }
                .ff-chat-typing {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                    background: #f0f4ff;
                    border-radius: 16px;
                    align-self: flex-start;
                    max-width: 60px;
                }
                .ff-chat-typing span {
                    width: 8px;
                    height: 8px;
                    background: #667eea;
                    border-radius: 50%;
                    animation: typingDot 1.4s infinite;
                }
                .ff-chat-typing span:nth-child(2) { animation-delay: 0.2s; }
                .ff-chat-typing span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typingDot {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                    30% { transform: translateY(-5px); opacity: 1; }
                }
                .ff-chat-input-area {
                    padding: 15px;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 10px;
                }
                .ff-chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e0e0e0;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .ff-chat-input:focus {
                    border-color: ${CONFIG.primaryColor};
                }
                .ff-chat-send {
                    width: 45px;
                    height: 45px;
                    background: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, ${CONFIG.secondaryColor} 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }
                .ff-chat-send:hover {
                    transform: scale(1.1);
                }
                .ff-chat-trigger {
                    position: fixed;
                    bottom: 20px;
                    right: 90px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, ${CONFIG.secondaryColor} 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: transform 0.3s, box-shadow 0.3s;
                    z-index: 9996;
                }
                .ff-chat-trigger:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
                .ff-chat-trigger svg {
                    width: 28px;
                    height: 28px;
                    fill: white;
                }
                .ff-chat-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 20px;
                    height: 20px;
                    background: #ff4757;
                    border-radius: 50%;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 11px;
                    font-weight: bold;
                }
                .ff-chat-quick-replies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 10px 15px;
                    border-top: 1px solid #eee;
                }
                .ff-quick-reply {
                    background: #f0f4ff;
                    border: 1px solid ${CONFIG.primaryColor};
                    color: ${CONFIG.primaryColor};
                    padding: 8px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ff-quick-reply:hover {
                    background: ${CONFIG.primaryColor};
                    color: white;
                }
                @media (max-width: 480px) {
                    .ff-chat-widget {
                        width: 100%;
                        height: 100%;
                        max-height: 100%;
                        bottom: 0;
                        right: 0;
                        border-radius: 0;
                    }
                    .ff-chat-header {
                        border-radius: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        createWidget() {
            // Chat trigger button
            const trigger = document.createElement('div');
            trigger.className = 'ff-chat-trigger';
            trigger.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    <circle cx="12" cy="10" r="1.5"/>
                    <circle cx="8" cy="10" r="1.5"/>
                    <circle cx="16" cy="10" r="1.5"/>
                </svg>
                <span class="ff-chat-badge">1</span>
            `;
            document.body.appendChild(trigger);

            // Chat widget
            const widget = document.createElement('div');
            widget.className = 'ff-chat-widget';
            widget.innerHTML = `
                <div class="ff-chat-header">
                    <div class="ff-chat-header-info">
                        <div class="ff-chat-avatar">🤖</div>
                        <div class="ff-chat-header-text">
                            <h4>Flo Faction AI</h4>
                            <span>Online • Ready to help</span>
                        </div>
                    </div>
                    <button class="ff-chat-close">&times;</button>
                </div>
                <div class="ff-chat-messages"></div>
                <div class="ff-chat-quick-replies">
                    <button class="ff-quick-reply" data-message="Get a quote">💰 Get Quote</button>
                    <button class="ff-quick-reply" data-message="Book appointment">📅 Book</button>
                    <button class="ff-quick-reply" data-message="Tell me about Dynasty">🏛️ Dynasty</button>
                    <button class="ff-quick-reply" data-message="What services do you offer?">❓ Services</button>
                </div>
                <div class="ff-chat-input-area">
                    <input type="text" class="ff-chat-input" placeholder="Type your message...">
                    <button class="ff-chat-send">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            `;
            document.body.appendChild(widget);

            this.elements = {
                trigger,
                widget,
                messages: widget.querySelector('.ff-chat-messages'),
                input: widget.querySelector('.ff-chat-input'),
                sendBtn: widget.querySelector('.ff-chat-send'),
                closeBtn: widget.querySelector('.ff-chat-close'),
                badge: trigger.querySelector('.ff-chat-badge'),
                quickReplies: widget.querySelectorAll('.ff-quick-reply')
            };
        }

        bindEvents() {
            this.elements.trigger.addEventListener('click', () => this.toggle());
            this.elements.closeBtn.addEventListener('click', () => this.close());

            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });

            this.elements.quickReplies.forEach(btn => {
                btn.addEventListener('click', () => {
                    const message = btn.dataset.message;
                    this.elements.input.value = message;
                    this.sendMessage();
                });
            });

            // Track activity
            document.addEventListener('mousemove', () => this.lastActivity = Date.now());
            document.addEventListener('keypress', () => this.lastActivity = Date.now());
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.elements.widget.classList.add('open');
            this.elements.badge.style.display = 'none';
            this.elements.input.focus();
        }

        close() {
            this.isOpen = false;
            this.elements.widget.classList.remove('open');
        }

        showGreeting() {
            if (this.messages.length === 0) {
                this.elements.badge.style.display = 'flex';
            }
        }

        checkIdlePrompt() {
            if (this.isOpen && Date.now() - this.lastActivity > CONFIG.idlePromptDelay && this.messages.length > 0) {
                // Don't prompt if they're already engaged
            }
        }

        sendMessage() {
            const text = this.elements.input.value.trim();
            if (!text) return;

            // Add user message
            this.addMessage(text, 'user');
            this.elements.input.value = '';

            // Show typing indicator
            this.showTyping();

            // Process and respond
            setTimeout(() => {
                this.hideTyping();
                this.processMessage(text);
            }, 1000 + Math.random() * 1000);
        }

        addMessage(text, type) {
            const message = document.createElement('div');
            message.className = `ff-chat-message ${type}`;
            message.innerHTML = type === 'bot' ? formatMessage(text) : text;
            this.elements.messages.appendChild(message);
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
            this.messages.push({ text, type, timestamp: new Date() });
        }

        showTyping() {
            this.isTyping = true;
            const typing = document.createElement('div');
            typing.className = 'ff-chat-typing';
            typing.id = 'typing-indicator';
            typing.innerHTML = '<span></span><span></span><span></span>';
            this.elements.messages.appendChild(typing);
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }

        hideTyping() {
            this.isTyping = false;
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
        }

        processMessage(text) {
            const { name, intent, match } = detectIntent(text);
            const response = intent.response(match, text);
            this.addMessage(response, 'bot');

            // Log interaction for analytics
            this.logInteraction(text, response, name);
        }

        logInteraction(userMessage, botResponse, intent) {
            // Send to analytics endpoint if configured
            console.log('Chat Interaction:', { userMessage, intent, timestamp: new Date() });
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        new AIChatWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
