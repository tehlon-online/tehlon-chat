// api/chat.js - Vercel serverless function

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { message, userId = 'anonymous', conversation = [], bot = null } = req.body;

            // If this is the user's first message, respond with all bots in order
            if (message && message.trim() !== '' && !bot) {
                // User's first message, respond with all bots
                const botOrder = [
                    { name: 'OpenAI', key: 'openai' },
                    { name: 'Gemini', key: 'gemini' },
                    { name: 'Claude', key: 'claude' }
                ];
                const botMessages = [];
                for (const b of botOrder) {
                    const content = await generateBotResponse(message, conversation, b.key);
                    botMessages.push({ name: b.name, content });
                }
                res.json({ botMessages });
                return;
            }

            // If this is a bot turn, respond with only that bot
            if (bot) {
                const botName = bot.charAt(0).toUpperCase() + bot.slice(1);
                const content = await generateBotResponse('', conversation, bot);
                res.json({ botMessage: { name: botName, content } });
                return;
            }

            // Fallback: error
            res.status(400).json({ error: 'Invalid request' });
        } catch (error) {
            console.error('Chat API Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}


// Function to generate bot responses
async function generateBotResponse(userMessage, conversation, botKey) {
    // Compose context from last 10 messages
    const context = (conversation || []).slice(-10);

    // System prompts for roundtable awareness and brevity
    const roundtablePrompt =
        'You are participating in a roundtable chat with other AI bots (OpenAI, Gemini, Claude) and a user on Tehlon.com. '
        + 'You should reference and respond to the previous messages from the other bots and the user. Keep your responses brief, friendly, and conversational. Do not repeat yourself. If you are Gemini, be concise.';

    // OpenAI
    if (botKey === 'openai' && process.env.OPENAI_API_KEY) {
        try {
            const messages = [
                { role: 'system', content: roundtablePrompt + ' You are OpenAI.' }
            ];
            for (const msg of context) {
                // Label other bots in the conversation
                let role = 'assistant';
                if (msg.sender === 'user') role = 'user';
                else if (msg.sender === 'Gemini') role = 'assistant';
                else if (msg.sender === 'Claude') role = 'assistant';
                else if (msg.sender === 'OpenAI') role = 'assistant';
                messages.push({ role, content: `[${msg.sender}] ${msg.content}` });
            }
            if (userMessage) {
                messages.push({ role: 'user', content: userMessage });
            }
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages,
                    max_tokens: 150,
                    temperature: 0.8
                })
            });
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API Error:', error);
        }
    }
    // Gemini (Google)
    if (botKey === 'gemini' && process.env.GEMINI_API_KEY) {
        try {
            // Gemini expects a single prompt string, so join messages
            const messages = [];
            messages.push(`System: ${roundtablePrompt} You are Gemini.`);
            for (const msg of context) {
                messages.push(`${msg.sender}: ${msg.content}`);
            }
            if (userMessage) {
                messages.push(`User: ${userMessage}`);
            }
            const prompt = messages.join('\n');
            const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
            const body = {
                contents: [{ parts: [{ text: prompt }] }]
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_API_KEY
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                // Try to parse error details from response
                let errMsg = response.statusText;
                try {
                    const errData = await response.json();
                    if (errData && errData.error && errData.error.message) {
                        errMsg = errData.error.message;
                    }
                } catch {}
                throw new Error('Gemini API error: ' + errMsg);
            }
            const data = await response.json();
            // Gemini returns candidates[0].content.parts[0].text
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '[Gemini: No response]';
        } catch (error) {
            console.error('Gemini API Error:', error);
            return `Gemini (Google) error: ${error.message}`;
        }
    }
    // Claude
    if (botKey === 'claude' && process.env.ANTHROPIC_API_KEY) {
        try {
            let prompt = `${roundtablePrompt} You are Claude.\n`;
            for (const msg of context) {
                prompt += `${msg.sender}: ${msg.content}\n`;
            }
            if (userMessage) {
                prompt += `user: ${userMessage}\n`;
            }
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 150,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            });
            if (!response.ok) {
                throw new Error(`Claude API error: ${response.status}`);
            }
            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API Error:', error);
        }
    }
    // Fallback responses for demo purposes
    const fallback = {
        openai: `OpenAI says: [No API key or error. This is a demo response.]`,
        gemini: `Gemini (Google) says: [No API key or error. This is a demo response.]`,
        claude: `Claude says: [No API key or error. This is a demo response.]`
    };
    return fallback[botKey] || 'Bot is unavailable.';
}
