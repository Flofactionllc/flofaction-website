/**
 * Qualifire AI API Integration
 * Handles evaluation of responses and prompts using Qualifire API
 * PHASE 1-B: Qualifire API Backend Integration
 */

const fetch = require('node-fetch');

const QUALIFIRE_API_URL = process.env.QUALIFIRE_API_URL || 'https://api.qualifire.ai';
const QUALIFIRE_API_KEY = process.env.QUALIFIRE_API_KEY;

/**
 * Evaluate a response using Qualifire API
 * POST /api/qualifire/evaluate-response
 */
async function evaluateResponse(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { response, context } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const qualiResponse = await fetch(`${QUALIFIRE_API_URL}/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QUALIFIRE_API_KEY}`
      },
      body: JSON.stringify({
        response: response,
        context: context || {},
        evaluation_type: 'safety_and_quality'
      })
    });

    const result = await qualiResponse.json();

    if (!qualiResponse.ok) {
      return res.status(qualiResponse.status).json(result);
    }

    res.status(200).json({
      safety_score: result.safety_score,
      issues: result.issues,
      approved: result.safety_score >= 0.8
    });
  } catch (error) {
    console.error('Qualifire evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate response' });
  }
}

/**
 * Evaluate a prompt using Qualifire API
 * POST /api/qualifire/evaluate-prompt
 */
async function evaluatePrompt(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, instructions } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const qualiResponse = await fetch(`${QUALIFIRE_API_URL}/prompt-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QUALIFIRE_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        instructions: instructions || {},
        validation_level: 'standard'
      })
    });

    const result = await qualiResponse.json();

    if (!qualiResponse.ok) {
      return res.status(qualiResponse.status).json(result);
    }

    res.status(200).json({
      is_valid: result.is_valid,
      confidence: result.confidence,
      suggestions: result.suggestions || []
    });
  } catch (error) {
    console.error('Qualifire prompt validation error:', error);
    res.status(500).json({ error: 'Failed to validate prompt' });
  }
}

module.exports = {
  evaluateResponse,
  evaluatePrompt
};
