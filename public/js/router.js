// Flo Faction Website Router - Fixes all button routing
class FloFactionRouter {
  constructor() {
    this.apiEndpoints = {
      contact: 'https://us-central1-flofaction-website-44132480.cloudfunctions.net/contact',
      batchCall: 'https://us-central1-flofaction-website-44132480.cloudfunctions.net/batchCall',
      getSubmissions: 'https://us-central1-flofaction-website-44132480.cloudfunctions.net/getSubmissions'
    };
    this.init();
  }

  init() {
    // Attach listeners to all form submissions
    this.attachFormListeners();
    // Route all button clicks
    this.attachButtonListeners();
  }

  attachFormListeners() {
    const contactForm = document.getElementById('contact-form') || 
                        document.querySelector('form[data-form="contact"]');
    
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }
  }

  attachButtonListeners() {
    // Contact form submission button
    document.querySelectorAll('[data-action="submit-contact"], button[type="submit"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleContactSubmit(e));
    });
    // Batch calling button
    document.querySelectorAll('[data-action="start-batch-call"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleBatchCall(e));
    });
  }

  async handleContactSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('email')?.value ||
                  document.querySelector('input[name="email"]')?.value;
    const message = document.getElementById('message')?.value ||
                    document.querySelector('textarea[name="message"]')?.value;
    const name = document.querySelector('input[name="name"]')?.value;

    if (!email || !message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(this.apiEndpoints.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, name })
      });
      const data = await response.json();
      if (data.success) {
        alert('Message sent successfully! We will contact you soon.');
        document.querySelector('form')?.reset();
      } else {
        alert('Error: ' + (data.error || 'Failed to send message'));
      }
    } catch (error) {
      alert('Network error: ' + error.message);
      console.error('Contact submit error:', error);
    }
  }

  async handleBatchCall(e) {
    e.preventDefault();
    const phoneNumber = prompt('Enter phone number for call:');
    if (!phoneNumber) return;

    try {
      const response = await fetch(this.apiEndpoints.batchCall, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          name: 'Customer',
          agentId: 'agent_2401kcafh68jer4s67d2d3y37mcv'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Call initiated! ' + data.message);
      } else {
        alert('Error: ' + (data.error || 'Failed to initiate call'));
      }
    } catch (error) {
      alert('Network error: ' + error.message);
      console.error('Batch call error:', error);
    }
  }
}

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FloFactionRouter());
} else {
  new FloFactionRouter();
}
