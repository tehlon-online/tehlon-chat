// api/model.js - Returns current model configuration
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        let modelInfo = {
            provider: 'demo',
            model: 'Fun Responses',
            hasApiKey: false
        };

        // Check which API key is configured
        if (process.env.OPENAI_API_KEY) {
            modelInfo = {
                provider: 'openai',
                model: 'gpt-4', // Update this if you change the model in chat.js
                hasApiKey: true
            };
        } else if (process.env.CLAUDE_API_KEY) {
            modelInfo = {
                provider: 'claude',
                model: 'claude-3-haiku',
                hasApiKey: true
            };
        }

        res.json(modelInfo);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}