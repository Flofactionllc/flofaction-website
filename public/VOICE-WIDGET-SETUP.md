# Flo Faction Voice Widget Setup Guide

## Overview

The Flo Faction AI Financial Advisor is a voice-enabled conversational widget that provides insurance and wealth-building guidance to users. The widget is powered by ElevenLabs and provides real-time voice interaction, text chat, and feedback collection.

## Embed Code

To add the voice widget to your website, paste the following code snippet into your HTML file, preferably just before the closing `</body>` tag:

```html
<elevenlabs-convai agent-id="agent_4101kcageta4eqh970hcgxqcp7n1"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed@beta" async type="text/javascript"></script>
```

## Widget Features

- **Voice Conversations**: Talk naturally with the AI Financial Advisor
- **Text Chat**: Send messages for written interactions
- **Feedback Collection**: Rate your experience after each conversation (1-5 scale)
- **Terms & Conditions**: Users accept terms before initiating calls
- **Multi-language Support**: Available in multiple languages
- **Responsive Design**: Works on desktop and mobile devices

## Configuration

The widget is configured with the following settings:

### Text Labels
- Main label: "Financial Advisor"
- Start call button: "Talk to advisor"
- Start chat button: "Send a message"
- New conversation: "Start new consultation"

### Terms & Conditions
Users must accept the terms and conditions before using the widget. The acceptance status is stored in local storage under the key `flo_faction_terms_accepted`, preventing repeated prompts for returning visitors.

### Features Enabled
- Feedback collection: Yes
- Widget v2 (Beta): Yes
- Chat (text-only) mode: Yes
- Send text while on call: Yes
- Realtime transcript: No
- Language dropdown: No
- Mute button: Yes

## Widget Placement

The widget appears as a floating button in the bottom-right corner of the page. Users can click to start a call or begin text chat.

## Customization

For advanced customization options (colors, sizing, placement), please refer to the ElevenLabs widget documentation or contact the development team.

## Support

For issues or questions about the widget implementation, please contact the Flo Faction technical team.
