# Flo Faction AI Financial Advisor - Quick Reference

🚀 STATUS: LIVE IN PRODUCTION
📅 Deployment: December 12, 2025

---

## ESSENTIAL LINKS

**Public Agent:** https://elevenlabs.io/app/agents/talk-to/agent_4101kcageta4eqh970hcgxqcp7n1
**Website:** https://www.flofaction.com
**Repository:** https://github.com/Flofactionllc/flofaction-website
**Agent ID:** agent_4101kcageta4eqh970hcgxqcp7n1

---

## QUICK FACTS

✅ Agent Status: Live 100%
✅ Widget Deployed: index.html, insurance.html, portfolio.html
✅ Voice + Chat: Both enabled
✅ Languages: 30+ supported
✅ Terms: Required before calls
✅ Feedback: 1-5 star collection enabled
✅ CI/CD: GitHub Actions auto-deploy

---

## WIDGET CODE

Embedded on all pages:
<elevenlabs-convai agent-id="agent_4101kcageta4eqh970hcgxqcp7n1"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed@beta" async></script>

---

## KEY FEATURES

✓ Voice conversations with AI
✓ Text chat mode
✓ Multi-language support
✓ Mute button
✓ User feedback collection
✓ Terms acceptance modal
✓ Rich text formatting (v2)
✓ Analytics dashboard

---

## CONFIGURATION

Widget Label: "Financial Advisor"
Call Button: "Talk to advisor"
Chat Button: "Send a message"
New Call: "Start new consultation"
Terms Storage Key: flo_faction_terms_accepted
Placement: Bottom-right
Variant: Full

---

## DEPLOYMENT PIPELINE

1. Code changes pushed to GitHub main branch
2. GitHub Actions workflow triggers automatically
3. Deploy job runs in ~9 seconds
4. Changes live on website
5. File: .github/workflows/deploy.yml

---

## COMPLIANCE

Terms include:
- Recording disclosure
- Data sharing consent
- AI limitation warning
- Legal/financial advice disclaimer

Local storage persists acceptance across visits.

---

## MONITORING METRICS

Track in ElevenLabs Dashboard:
- Call duration and frequency
- User feedback ratings
- Conversation success rates
- Error logs
- Language distribution
- User drop-off points

---

## TROUBLESHOOTING

Widget not visible → Hard refresh (Ctrl+Shift+R), clear cache
No audio → Check permissions, test WebRTC in browser
Terms missing → Verify toggle, check markdown syntax
Call issues → Check internet, verify microphone access

---

## DOCUMENTATION

📄 PRODUCTION-DEPLOYMENT-GUIDE.md - Complete details
📄 VOICE-WIDGET-SETUP.md - Setup instructions
📄 This file - Quick reference

---

**Status: ✅ COMPLETE | Last Updated: Dec 12, 2025 11 PM EST**
