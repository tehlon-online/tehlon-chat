// api/health.js - Vercel serverless function for health checks
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
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            service: 'Tehlon.com Chat API',
            version: '1.0.0'
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}