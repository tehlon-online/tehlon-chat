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
            const { message, userId = 'anonymous' } = req.body;
            
            if (!message || message.trim() === '') {
                return res.status(400).json({ error: 'Message is required' });
            }

            // Generate bot response
            const botResponse = await generateBotResponse(message);
            
            const userMessage = {
                id: Date.now(),
                content: message,
                sender: 'user',
                userId: userId,
                timestamp: new Date().toISOString()
            };

            const botMessage = {
                id: Date.now() + 1,
                content: botResponse,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            res.json({
                userMessage,
                botMessage
            });

        } catch (error) {
            console.error('Chat API Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

// Function to generate bot responses
async function generateBotResponse(userMessage) {
    // Check for OpenAI API key
    if (process.env.OPENAI_API_KEY) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful and fun assistant on Tehlon.com, a silly website just for fun. Keep responses casual and engaging."
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],
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
            // Fall back to simple responses
        }
    }

    // Check for Claude API key
    if (process.env.CLAUDE_API_KEY) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.CLAUDE_API_KEY,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 150,
                    messages: [
                        {
                            role: "user",
                            content: `You are a helpful and fun assistant on Tehlon.com, a silly website just for fun. Keep responses casual and engaging. User said: ${userMessage}`
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
            // Fall back to simple responses
        }
    }
    
    // Fallback responses for demo purposes
    const responses = [
        `You said: "${userMessage}" - That's pretty cool!`,
        `I heard you loud and clear: "${userMessage}"`,
        `Thanks for sharing: "${userMessage}". What else is on your mind?`,
        `"${userMessage}" - I'm processing that... beep boop! 🤖`,
        `Your message "${userMessage}" has been received by the Tehlon.com bot! ✨`,
        `Interesting point about "${userMessage}"! Tell me more!`,
        `"${userMessage}" - now that's what I call conversation! 💭`,
        `Processing your message: "${userMessage}"... completed! What's next?`
    ];
    
    // Add some randomness
    return responses[Math.floor(Math.random() * responses.length)];
}