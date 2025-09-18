# Render Deployment Guide

This guide will help you deploy the RAG Chatbot backend on Render with all necessary services.

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **API Keys**: Get your Jina AI and Google Gemini API keys

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create Services on Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**:

   - Connect your GitHub repository
   - Choose "Web Service"
   - Select your repository and branch
   - Configure:
     - **Name**: `rag-chatbot-backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: `Starter` ($7/month)

3. **Create Redis Instance**:

   - Choose "Redis"
   - **Name**: `rag-chatbot-redis`
   - **Plan**: `Free`
   - **Region**: `Oregon`

4. **Create ChromaDB Service**:
   - Choose "Web Service"
   - **Name**: `rag-chatbot-chroma`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./chroma.Dockerfile`
   - **Plan**: `Starter` ($7/month)

### Option B: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:

1. Go to Render Dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect and use the `render.yaml` file

## Step 3: Configure Environment Variables

### Backend Service Environment Variables:

```
NODE_ENV=production
JINA_API_KEY=your_jina_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_URL=redis://username:password@host:port
CHROMA_URL=https://your-chroma-service.onrender.com
CHROMA_COLLECTION=news_articles
SESSION_TTL_SECONDS=86400
RUN_INGESTION=true
```

### How to get Redis URL:

1. Go to your Redis service on Render
2. Copy the "External Redis URL"
3. Use this as your `REDIS_URL`

### How to get ChromaDB URL:

1. Go to your ChromaDB service on Render
2. Copy the service URL
3. Use this as your `CHROMA_URL`

## Step 4: Deploy and Test

1. **Deploy Backend**:

   - Render will automatically deploy when you push to GitHub
   - Check the logs to ensure all services start correctly

2. **Test the API**:

   - Go to your backend service URL
   - Visit `https://your-backend.onrender.com/health`
   - Should return `{"ok": true}`

3. **Run Ingestion** (if needed):
   - The startup script will automatically run ingestion on first deployment
   - Check logs to see ingestion progress

## Step 5: Update Frontend

Update your frontend's environment variables:

```bash
VITE_API_BASE=https://your-backend.onrender.com
```

## Troubleshooting

### Common Issues:

1. **ChromaDB Connection Failed**:

   - Ensure ChromaDB service is running
   - Check the CHROMA_URL environment variable
   - Wait for ChromaDB to fully start (can take 2-3 minutes)

2. **Redis Connection Failed**:

   - Verify REDIS_URL is correct
   - Check Redis service is running

3. **Ingestion Fails**:

   - Check JINA_API_KEY is set correctly
   - Verify API key has sufficient quota
   - Check logs for specific error messages

4. **Service Won't Start**:
   - Check build logs for dependency issues
   - Ensure all environment variables are set
   - Verify the start command is correct

### Logs and Monitoring:

- **View Logs**: Go to your service → "Logs" tab
- **Health Checks**: Render automatically monitors your service health
- **Metrics**: Available in the "Metrics" tab

## Cost Estimate

- **Backend Service**: $7/month (Starter plan)
- **ChromaDB Service**: $7/month (Starter plan)
- **Redis**: Free (Free plan)
- **Total**: ~$14/month

## Production Considerations

1. **Scaling**: Upgrade to higher plans for more resources
2. **Monitoring**: Set up alerts for service health
3. **Backup**: Regular backups of your data
4. **Security**: Use strong API keys and rotate them regularly

## Support

If you encounter issues:

1. Check the Render documentation: https://render.com/docs
2. Review service logs for error messages
3. Ensure all environment variables are correctly set
4. Verify all services are running and accessible
