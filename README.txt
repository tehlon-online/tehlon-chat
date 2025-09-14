# 🎯 Tehlon.com Chat - Quick Setup Guide

A fun serverless chat application that runs on Vercel with AI integration.

## 📂 File Structure

Your project should look like this:
```
tehlon-chat/
├── index.html          # Main webpage (root level!)
├── vercel.json         # Vercel routing config
├── package.json        # Dependencies
├── .env.local          # Your API keys (for local dev)
├── README.md           # This guide
└── api/
    ├── chat.js         # Chat API endpoint
    └── health.js       # Health check endpoint
```

## 🚀 Quick Deploy to Vercel

### Method 1: GitHub + Vercel (Recommended)
1. Create a GitHub repo and upload all files
2. Go to [vercel.com](https://vercel.com) and connect your repo
3. Add your API key in Vercel Settings > Environment Variables
4. Deploy! 🎉

### Method 2: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🔑 API Keys (Optional but Recommended)

The chat works in demo mode without keys, but for real AI responses:

**Option A: OpenAI**
1. Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to Vercel: `OPENAI_API_KEY=your_key_here`

**Option B: Claude**
1. Get API key from [console.anthropic.com](https://console.anthropic.com/)
2. Add to Vercel: `CLAUDE_API_KEY=your_key_here`

## 💻 Local Development

1. Save all files in a folder
2. Create `.env.local` and add your API key
3. Run: `npx vercel dev`
4. Open: http://localhost:3000

## 🎯 Important Notes

- ✅ `index.html` goes in the ROOT directory (not in a folder)
- ✅ Create an `api/` folder for the two .js files  
- ✅ Use `.env.local` for local development
- ✅ Add environment variables in Vercel dashboard for production
- ✅ The app works without API keys (demo responses)

## 🐛 Troubleshooting

**"API not found"** → Check that `api/chat.js` is in the `/api` folder
**"No response"** → Add your API key to Vercel environment variables  
**"CORS error"** → Make sure you're using the Vercel URL, not file://

## 🎉 That's It!

Your chat should work immediately. Add an AI API key for smarter responses, or enjoy the fun demo mode! 

Questions? Check the files or Vercel docs. Happy chatting! 💬