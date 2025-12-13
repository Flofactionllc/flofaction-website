# Flo Faction Agent Implementation Guide

## Overview
This guide provides step-by-step instructions for integrating ElevenLabs voice agents into the Flo Faction website. Each page has been configured with a specialized agent designed to handle specific customer interactions.

## What's Included

### New Files Added
1. **js/agents-config.js** - Agent configuration mappings for each page
2. **js/agent-integration.js** - Client-side agent initialization and management
3. **functions/agent-handler.js** - Backend Cloud Functions for agent routing

## Page-Specific Agents

### 1. Home Page Agent (Home Guide)
- **Agent ID**: agent_2401kcafh68jer4s67d2d3y37mcv
- **Purpose**: Welcome new visitors and qualify their needs
- **Triggers**: Page load
- **Capabilities**:
  - Greeting visitors professionally
  - Identifying customer needs (insurance, wealth building, financial services)
  - Directing visitors to appropriate pages
  - Answering basic questions about Flo Faction

### 2. Services Page Agent (Services Consultant)
- **Agent ID**: agent_4101kcageta4eqh970hcgxqcp7n1
- **Purpose**: Explain service offerings and help with selection
- **Triggers**: User scrolls 25% down page
- **Capabilities**:
  - Explaining each service in detail
  - Business Insurance consultation
  - Wealth Building guidance
  - Financial Planning advice
  - Recommending appropriate service packages

### 3. Insurance Page Agent (Insurance Specialist)
- **Agent ID**: agent_9501ka7zqvgwfsrrzzxwyrshjmcx
- **Purpose**: Provide detailed insurance information and process quotes
- **Triggers**: When user scrolls to insurance section
- **Capabilities**:
  - Explaining coverage options (Health, Liability, Disability, Retirement)
  - Comparing different plans
  - Processing quote requests
  - Answering policy questions

### 4. Contact Page Agent (Sales & Support)
- **Agent ID**: agent_2401kcafh68jer4s67d2d3y37mcv
- **Purpose**: Handle inquiries and qualify leads
- **Triggers**: Form focus/interaction
- **Capabilities**:
  - Greeting customers
  - Collecting contact information
  - Qualifying leads
  - Scheduling consultations
  - Storing lead information in Firestore

## Installation Steps

### Step 1: Update HTML Files
Add the following script tags to the `<head>` section of each HTML file (before closing `</head>`):

```html
<!-- Flo Faction Agent Integration -->
<script src="js/agents-config.js"></script>
<script src="js/agent-integration.js"></script>
```

### Step 2: Deploy Cloud Functions
The new agent handler function needs to be deployed:

```bash
cd functions
firebase deploy --only functions
```

### Step 3: Verify Configuration
Ensure the following files are in place:
- `public/js/agents-config.js` ✓
- `public/js/agent-integration.js` ✓
- `functions/agent-handler.js` ✓
- `functions/package.json` (with required dependencies)

## API Endpoints

After deployment, you'll have access to these endpoints:

### Agent Interaction Routing
```
POST /routeAgentInteraction
Body: {
  pageType: 'home|services|insurance|contact',
  userInput: 'user message',
  userEmail: 'optional@email.com',
  userName: 'Optional Name'
}
```

### Get Agent Statistics
```
GET /getAgentStats
Returns: 30-day interaction statistics by page and agent
```

## Features Implemented

### Dynamic Agent Loading
- Agents automatically load based on current page
- Page type detected from URL hash (#home, #services, etc.)
- Widget appears in fixed bottom-right corner

### Event-Based Triggers
- **Page Load**: Home and Services pages
- **Scroll Detection**: 25% scroll threshold on Services
- **Section Intersection**: When user scrolls to Insurance section
- **Form Focus**: Contact page form interactions

### Lead Management
- Automatic lead scoring based on keywords (0-10 scale)
- Firestore integration for lead storage
- Contact submissions tracked with timestamps
- Qualification metrics captured

### Analytics & Reporting
- All interactions logged to `agent_interactions` collection
- Statistics available for last 30 days
- Breakdown by page type and agent
- Completion rate tracking

## Firestore Collections

The following collections will be created automatically:

### agent_interactions
```javascript
{
  pageType: 'home',
  agentId: 'agent_xxx',
  agentName: 'Home Guide',
  userInput: 'customer message',
  userEmail: 'email@example.com',
  userName: 'Customer Name',
  timestamp: Timestamp,
  status: 'initiated|completed',
  response: { /* agent response */ }
}
```

### leads
```javascript
{
  name: 'Customer Name',
  email: 'email@example.com',
  inquiry: 'customer inquiry text',
  pageOrigin: 'contact',
  timestamp: Timestamp,
  status: 'new|contacted|qualified',
  qualificationScore: 8
}
```

## Testing the Integration

### Manual Testing
1. Navigate to https://www.flofaction.com
2. Verify agent widget appears in bottom-right corner
3. Click the agent widget to open chat
4. Test on each page (Home, Services, Insurance, Contact)
5. Verify correct agent is active for each page

### Browser Console
Check the browser console for initialization logs:
```
Flo Faction Agent initialized for [page] page: [Agent Name]
```

### Lead Tracking
1. Submit contact form on Contact page
2. Check Firebase Console > Firestore
3. Verify lead appears in `leads` collection
4. Confirm qualification score is calculated

## Customization

### Changing Agent IDs
Edit `js/agents-config.js` and update agent IDs for each page:
```javascript
home: {
  agentId: 'your_new_agent_id',
  // ... rest of config
}
```

### Modifying System Prompts
Update the `systemPrompt` field in each agent configuration to customize agent behavior.

### Adjusting Trigger Events
Modify `triggerEvent` in agent config:
- `'page-load'` - Loads immediately
- `'user-scroll'` - Loads after scrolling
- `'section-enter'` - Loads when section visible
- `'form-focus'` - Loads on form interaction

## Troubleshooting

### Agent Not Appearing
1. Check browser console for errors
2. Verify script tags are in HTML `<head>`
3. Ensure agents-config.js loads before agent-integration.js
4. Check ElevenLabs API key in Cloud Functions

### Interactions Not Being Logged
1. Verify Firestore is enabled in Firebase project
2. Check Cloud Functions are deployed
3. Review Firebase security rules
4. Check browser network tab for API calls

### Wrong Agent on Page
1. Check page detection logic in `detectPageType()`
2. Verify URL uses correct hash (#home, #services, etc.)
3. Review agent configuration in agents-config.js

## Performance Optimization

- Agent widget loads lazily after page content
- Firestore writes are batched for efficiency
- Lead qualification score calculated server-side
- Statistics queries use indexed fields for speed

## Security Considerations

- API endpoints are protected by CORS
- Firestore security rules should be configured
- User emails and names are optional (defaults to anonymous)
- Lead data should be encrypted at rest

## Monitoring & Maintenance

### Key Metrics to Monitor
1. Total interactions per day
2. Completion rate by page
3. Average agent response time
4. Lead qualification distribution
5. Agent error rates

### Regular Maintenance
- Review interaction logs weekly
- Check Firestore database size
- Monitor Cloud Functions costs
- Update agent prompts based on customer feedback

## Next Steps

1. Deploy Cloud Functions
2. Add script tags to all HTML files
3. Test on each page type
4. Monitor interactions in Firebase Console
5. Iterate on agent prompts based on real interactions

## Support & Questions

For issues or questions:
1. Check browser console logs
2. Review Firebase Cloud Functions logs
3. Verify Firestore collections are created
4. Test agent endpoints using curl or Postman

## Version History

- **v1.0** (December 12, 2025): Initial implementation with 4 page-specific agents
  - agents-config.js: Page-agent mappings
  - agent-integration.js: Client initialization
  - agent-handler.js: Backend routing and analytics
