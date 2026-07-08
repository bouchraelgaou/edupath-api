// EduPath AI — Secure Claude API proxy (Vercel serverless function)
// The Anthropic API key lives ONLY in the ANTHROPIC_API_KEY environment
// variable on Vercel. It is never visible to students or in GitHub.

const ALLOWED_ORIGIN = 'https://bouchraelgaou.github.io';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server.' });
  }

  try {
    const { system, messages, max_tokens } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const payload = {
      model: 'claude-sonnet-5',
      max_tokens: Math.min(Number(max_tokens) || 1000, 4000),
      messages
    };
    if (typeof system === 'string' && system.length > 0) {
      payload.system = system.slice(0, 20000);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: String(err) });
  }
};
