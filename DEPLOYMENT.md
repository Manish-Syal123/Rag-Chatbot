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
     - **Plan**: `Starter` ($7/month) or `Free`

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
   - **Plan**: `Starter` ($7/month) or `Free`

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

### Step 6: Deploy Frontend on Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Import Project**:
   - Connect your GitHub repository
   - Select the frontend folder
3. **Configure Project**:
   - **Name**: `rag-chatbot-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
4. **Set Environment Variables**:
   - `VITE_API_BASE`: https://your-backend.onrender.com
5. **Deploy**: Click "Deploy"
6. **Test**: Visit the provided Vercel URL to ensure everything is working
<hr>

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

<hr>

### Simplefied Deployment steps

<hr>

#### Backend Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Name: rag-chatbot-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Plan: Free or Starter
4. Set the required environment variables (JINA_API_KEY , GEMINI_API_KEY and other environment variables)
5. The other environment variables will be automatically configured through the render.yaml file

#### Redis / key-value store on Render

1. Create a new Key Value service on Render
2. Use the following settings:
   - Name: rag-chatbot-keyvalue (or any name you prefer)
   - Region: Choose the same region you'll use for other services
   - Instance Type: Free

#### ChromaDB Deployment on Render

1. Create a new Web Service on Render. Go to https://dashboard.render.com/new/web-service
2. Use the following settings:
   - Name: rag-chatbot-chroma
   - Environment: Docker
   - Region: Same as Key Value service
   - Branch: main
   - Root Directory: backend (since chroma.Dockerfile is now in the backend folder)
   - Docker Build Context Directory: backend
   - Dockerfile Path: ./chroma.Dockerfile
   - Environment Variables:
     - CHROMA_SERVER_CORS_ORIGINS="Your rag-chatbot-backend URL"
     - CHROMA_SERVER_HOST=0.0.0.0
     - CHROMA_SERVER_HTTP_PORT=8000

#### For the backend service (rag-chatbot-backend), you'll need to set these environment variables:

1. From Key Value service:
   - REDIS_URL: Copy from Key Value service dashboard after creation
2. From ChromaDB service:
   - CHROMA_URL: Your ChromaDB service URL (e.g., https://rag-chatbot-chroma.onrender.com )

## Support

If you encounter issues:

1. Check the Render documentation: https://render.com/docs
2. Review service logs for error messages
3. Ensure all environment variables are correctly set
4. Verify all services are running and accessible
