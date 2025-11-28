# Quick Deployment Commands

## Local Testing Before Deployment

### Backend
```powershell
cd Backend
npm install
# Copy .env.production to .env and update values
cp .env.production .env
npm start
```

### Frontend
```powershell
cd next-frontend
npm install
# Update .env.local with backend URL
npm run build
npm start
```

---

## Docker Deployment (All-in-One)

### Prerequisites
- Docker and Docker Compose installed
- Create `.env` file in root directory with all variables

### Build and Run
```powershell
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```powershell
# Backend only
docker build -t ai-resume-backend -f Backend/Dockerfile .
docker run -p 3000:3000 --env-file Backend/.env ai-resume-backend

# Frontend only
docker build -t ai-resume-frontend -f next-frontend/Dockerfile .
docker run -p 8080:3000 --env-file next-frontend/.env.local ai-resume-frontend
```

---

## Vercel Deployment (Frontend)

### Install Vercel CLI
```powershell
npm install -g vercel
```

### Deploy Frontend
```powershell
cd next-frontend
vercel --prod
```

### Environment Variables (Set in Vercel Dashboard)
- `NEXT_PUBLIC_BACKEND_URL` = Your backend URL
- `JWT_SECRET` = Your JWT secret

---

## Railway Deployment

### Backend (Railway)
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd Backend
railway init

# Add environment variables
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set OPENAI_API_KEY="your-api-key"
railway variables set FRONTEND_URL="your-frontend-url"

# Deploy
railway up
```

### Frontend (Railway)
```powershell
cd next-frontend
railway init
railway variables set NEXT_PUBLIC_BACKEND_URL="your-backend-url"
railway variables set JWT_SECRET="your-jwt-secret"
railway up
```

---

## Render Deployment

### Backend
1. Go to render.com → New → Web Service
2. Connect GitHub repository
3. Settings:
   - Root Directory: `Backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in dashboard

### Frontend
1. Go to render.com → New → Static Site
2. Connect GitHub repository
3. Settings:
   - Root Directory: `next-frontend`
   - Build Command: `npm run build && npm run start`
   - Publish Directory: `.next`
4. Add environment variables in dashboard

---

## Environment Variables Checklist

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

### Frontend (.env.local or platform dashboard)
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
JWT_SECRET=your-secure-jwt-secret
```

---

## Post-Deployment Testing

### Test Backend
```powershell
# Health check
curl https://your-backend-url.com/health

# API test
curl https://your-backend-url.com/api/thread
```

### Test Frontend
1. Visit your frontend URL
2. Test login functionality
3. Test chat functionality
4. Test file upload

---

## Troubleshooting

### Build Fails
```powershell
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Environment Variables Not Working
- Restart the server/rebuild after changing env vars
- Check variable names (NEXT_PUBLIC_ prefix for client-side)
- Verify no typos in variable names

### CORS Issues
- Update FRONTEND_URL in backend .env
- Ensure protocol (http/https) matches
- Check browser console for exact error

### Database Connection Issues
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Test connection locally first

---

## Monitoring URLs

After deployment, save these URLs:
- Backend Health: `https://your-backend-url.com/health`
- Backend Metrics: `https://your-backend-url.com/metrics`
- Frontend: `https://your-frontend-url.com`
- MongoDB Dashboard: MongoDB Atlas dashboard URL

---

## Rollback (if needed)

### Railway/Render
- Use platform dashboard to rollback to previous deployment

### Vercel
```powershell
vercel rollback
```

### Docker
```powershell
docker-compose down
docker-compose up -d --force-recreate
```
