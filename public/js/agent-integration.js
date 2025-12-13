// Flo Faction - ElevenLabs Agent Integration
// Initializes and manages voice agents for each website page

class FloFactionAgentIntegration {
  constructor() {
    this.config = window.AGENT_CONFIG || {};
    this.currentAgent = null;
    this.agentWidget = null;
    this.pageType = this.detectPageType();
    this.init();
  }

  /**
   * Detect which page the user is on based on URL or DOM
   */
  detectPageType() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    if (url.includes('#home') || pathname === '/' || pathname === '/index.html') {
      return 'home';
    } else if (url.includes('#services') || pathname.includes('services')) {
      return 'services';
    } else if (url.includes('#insurance') || pathname.includes('insurance')) {
      return 'insurance';
    } else if (url.includes('#contact') || pathname.includes('contact')) {
      return 'contact';
    }
    return 'home'; // default
  }

  /**
   * Initialize the agent for the current page
   */
  init() {
    const agentConfig = this.config[this.pageType];
    
    if (!agentConfig) {
      console.warn(`No agent configuration found for page type: ${this.pageType}`);
      return;
    }

    // Store current agent configuration
    this.currentAgent = agentConfig;

    // Initialize ElevenLabs widget
    this.initElevenLabsWidget();

    // Set up event listeners
    this.setupEventListeners();

    console.log(`Flo Faction Agent initialized for ${this.pageType} page:`, agentConfig.agentName);
  }

  /**
   * Initialize ElevenLabs widget on the page
   */
  initElevenLabsWidget() {
    // Check if ElevenLabs script is loaded
    if (typeof ElevenLabs === 'undefined') {
      this.loadElevenLabsScript();
    } else {
      this.createWidgetContainer();
      this.startAgent();
    }
  }

  /**
   * Load ElevenLabs script dynamically
   */
  loadElevenLabsScript() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@elevenlabs/iframe@latest';
    script.async = true;
    
    script.onload = () => {
      console.log('ElevenLabs script loaded');
      this.createWidgetContainer();
      this.startAgent();
    };

    script.onerror = () => {
      console.error('Failed to load ElevenLabs script');
    };

    document.head.appendChild(script);
  }

  /**
   * Create widget container for the agent
   */
  createWidgetContainer() {
    // Check if widget already exists
    if (document.getElementById('elevenlabs-agent-widget')) {
      return;
    }

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'elevenlabs-agent-widget';
    widgetContainer.className = 'elevenlabs-widget-container';
    
    // Style the container
    widgetContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 12px;
      overflow: hidden;
    `;

    document.body.appendChild(widgetContainer);
    this.agentWidget = widgetContainer;
  }

  /**
   * Start the ElevenLabs agent
   */
  startAgent() {
    if (!this.currentAgent || !window.ElevenLabs) {
      console.error('Unable to start agent: missing configuration or ElevenLabs library');
      return;
    }

    try {
      // Initialize ElevenLabs agent widget
      ElevenLabs.createAgent({
        agentId: this.currentAgent.agentId,
        name: this.currentAgent.agentName,
        container: this.agentWidget,
        systemPrompt: this.currentAgent.systemPrompt,
        voiceSettings: this.currentAgent.voiceSettings
      });
      
      console.log('Agent started successfully');
    } catch (error) {
      console.error('Error starting agent:', error);
    }
  }

  /**
   * Set up page-specific event listeners
   */
  setupEventListeners() {
    const triggerEvent = this.currentAgent?.triggerEvent;

    switch (triggerEvent) {
      case 'page-load':
        // Agent automatically starts on page load
        break;

      case 'user-scroll':
        window.addEventListener('scroll', () => this.handleScroll());
        break;

      case 'section-enter':
        this.observeSections();
        break;

      case 'form-focus':
        const forms = document.querySelectorAll('form, input, textarea');
        forms.forEach(el => {
          el.addEventListener('focus', () => this.handleFormFocus());
        });
        break;

      default:
        break;
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    // Trigger agent after user has scrolled 25% down the page
    if (scrollPercentage > 25 && !this.agentActivated) {
      this.agentActivated = true;
      console.log('Agent activated due to user scroll');
    }
  }

  /**
   * Observe sections for intersection
   */
  observeSections() {
    const sections = document.querySelectorAll('section, [data-section]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Section entered:', entry.target);
          // Could trigger agent interaction here
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  }

  /**
   * Handle form focus events
   */
  handleFormFocus() {
    console.log('Form focused - agent ready to assist');
  }

  /**
   * Send message to the agent
   */
  sendMessage(message) {
    if (window.ElevenLabs && this.currentAgent) {
      // Implementation depends on ElevenLabs API
      console.log('Message sent to agent:', message);
    }
  }

  /**
   * Get current agent configuration
   */
  getAgentConfig() {
    return this.currentAgent;
  }

  /**
   * Update agent for page navigation
   */
  onPageChange(newPageType) {
    if (newPageType !== this.pageType) {
      this.pageType = newPageType;
      this.currentAgent = null;
      if (this.agentWidget) {
        this.agentWidget.remove();
      }
      this.init();
    }
  }
}

// Initialize agent when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.floFactionAgent = new FloFactionAgentIntegration();
  });
} else {
  window.floFactionAgent = new FloFactionAgentIntegration();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloFactionAgentIntegration;
}
