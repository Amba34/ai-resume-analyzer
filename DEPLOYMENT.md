# AI Resume Analyzer - Deployment Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud like MongoDB Atlas)
- OpenAI API key
- Google Cloud Vision API credentials (optional for OCR)

---

## Backend Deployment

### Environment Variables
Create a `.env` file in the `Backend/` directory with:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (your deployed frontend URL)
FRONTEND_URL=https://your-frontend-domain.com

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Google Cloud Vision (optional)
GOOGLE_APPLICATION_CREDENTIALS=./gen-lang-client-0514898714-71b9c5ae081a.json
```

### Deployment Options

#### Option 1: Railway / Render / Heroku
1. Connect your GitHub repository
2. Set the root directory to `Backend`
3. Add environment variables in the platform dashboard
4. Build command: `npm install`
5. Start command: `npm start`

#### Option 2: Vercel (Serverless)
Not recommended for this Express app due to long-running processes and file uploads.

#### Option 3: VPS/DigitalOcean/AWS EC2
```bash
# SSH into your server
cd /var/www/ai-resume-analyzer/Backend

# Install dependencies
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start index.js --name "ai-resume-backend"
pm2 startup
pm2 save

# Configure nginx as reverse proxy (port 3000 -> 80/443)
```

---

## Frontend Deployment

### Environment Variables
Create a `.env.local` or `.env.production` file in `next-frontend/`:

```env
# Backend API URL (your deployed backend URL)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Demo user (optional)
DEMO_USER={"id":1,"email":"demo@example.com","password":"$2a$10$..."}
```

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from next-frontend directory
cd next-frontend
vercel
```

Or connect GitHub repository at vercel.com and set:
- Framework Preset: Next.js
- Root Directory: `next-frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

#### Option 2: Netlify
```bash
cd next-frontend
npm run build

# Deploy .next folder
netlify deploy --prod
```

#### Option 3: Railway / Render
1. Connect GitHub repository
2. Set root directory to `next-frontend`
3. Build command: `npm run build`
4. Start command: `npm start`

---

## Post-Deployment Checklist

### Backend
- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] CORS configured with frontend URL
- [ ] Health endpoint accessible: `https://your-backend.com/health`
- [ ] API routes working: `https://your-backend.com/api/chat`

### Frontend
- [ ] Environment variables set correctly
- [ ] Backend API URL configured
- [ ] Login/authentication working
- [ ] File upload working
- [ ] Chat functionality working

### Security
- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS for both frontend and backend
- [ ] Restrict CORS to specific domains (no wildcards)
- [ ] Keep API keys secure (never commit to Git)
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper error handling (no sensitive info in errors)

---

## Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-domain.com/health
```

### Frontend Test
1. Visit your frontend URL
2. Try logging in
3. Test chat functionality
4. Upload a resume

---

## Troubleshooting

### Common Issues

**CORS Error**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend domain exactly
- Include protocol (`https://`) in the URL

**MongoDB Connection Failed**
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0` or specific IPs)
- Verify connection string format
- Ensure network access is configured

**Environment Variables Not Loading**
- Restart the server after changing `.env`
- For Vercel/Netlify, set variables in dashboard, not `.env` files
- Check variable names (frontend needs `NEXT_PUBLIC_` prefix for client-side)

**Build Fails**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version compatibility
- Review build logs for specific errors

---

## Monitoring

### Backend Monitoring
- Health endpoint: `/health`
- Metrics endpoint: `/metrics`
- Readiness check: `/ready`
- Liveness check: `/live`

### Recommended Tools
- **Backend**: PM2, New Relic, Datadog
- **Frontend**: Vercel Analytics, Google Analytics
- **Database**: MongoDB Atlas monitoring
- **Uptime**: UptimeRobot, Pingdom

---

## Scaling Considerations

- Use CDN for frontend static assets
- Implement Redis for session management
- Add rate limiting (express-rate-limit)
- Set up load balancer for multiple backend instances
- Use MongoDB replica set for high availability
- Implement caching for frequently accessed data
