// Vercel Serverless Function to forward intake form submissions to n8n webhook

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received form submission:', req.body);

    // Forward to n8n webhook
    const n8nResponse = await fetch(
      'https://flofaction.app.n8n.cloud/webhook/4d453ab9-7fd2-4c27-9d36-fc0ff30c9d13',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await n8nResponse.json();
    
    console.log('n8n webhook response:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully',
      data 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Failed to process form',
      details: error.message 
    });
  }
}
