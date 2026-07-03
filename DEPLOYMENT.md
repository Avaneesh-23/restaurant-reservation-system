# Deployment Guide

This guide explains how to deploy the Restaurant Reservation Management System to public platforms.

## Prerequisites

1. **MongoDB Atlas Account** - Free tier is sufficient
2. **Render Account** - For backend deployment (free tier available)
3. **Vercel Account** - For frontend deployment (free tier available)
4. **GitHub Account** - To host your repository

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (free tier)
3. Create a database user with username and password
4. Whitelist IP address: `0.0.0.0/0` (allows access from anywhere)
5. Get your connection string from the "Connect" button
6. Replace `<password>` with your database user password
7. Your connection string will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/restaurant_reservations
   ```

## Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. Go to [Render](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder as root directory
5. Configure:
   - **Name**: restaurant-reservation-api
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a random string (use: `openssl rand -base64 32`)
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Will be set after frontend deployment (e.g., `https://your-frontend.vercel.app`)
   - `PORT`: `10000` (Render uses port 10000 by default)
7. Click "Deploy Web Service"
8. Wait for deployment to complete (~5-10 minutes)
9. Note your backend URL: `https://restaurant-reservation-api.onrender.com`

### Option B: Using render.yaml

1. Push your code to GitHub
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your repository
4. Render will detect `render.yaml` in the backend folder
5. Fill in the environment variables when prompted
6. Deploy

### Seed the Database

After backend deployment:
1. Wait for the backend to be fully deployed and running
2. Make a POST request to the seed endpoint:
   ```
   POST https://your-backend-url.onrender.com/api/seed
   ```
3. You can use curl, Postman, or any HTTP client:
   ```bash
   curl -X POST https://restaurant-reservation-api.onrender.com/api/seed
   ```
4. This will create tables and admin user
5. You should see response: `{"success":true,"message":"Database seeded successfully"}`

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and create an account
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL + `/api`
     - Example: `https://restaurant-reservation-api.onrender.com/api`
6. Click "Deploy"
7. Wait for deployment to complete (~2-3 minutes)
8. Note your frontend URL: `https://your-project.vercel.app`

## Step 4: Update Backend CORS

After frontend deployment:
1. Go to your Render service dashboard
2. Click "Environment" tab
3. Update `CLIENT_URL` to your Vercel frontend URL
4. Click "Save Changes"
5. Render will automatically redeploy

## Step 5: Test Deployed Application

1. Open your frontend URL in a browser
2. Test customer registration and login
3. Test creating a reservation
4. Login as admin (use seeded credentials)
5. Test admin dashboard features

## Default Admin Credentials

After running the seed script:
- Email: `admin@restaurant.com`
- Password: `admin123`

You can customize these by setting environment variables before seeding:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check backend CORS settings (`CLIENT_URL`)
- Ensure backend is deployed and running

### MongoDB connection errors
- Verify IP whitelist in MongoDB Atlas
- Check database user credentials
- Ensure connection string format is correct

### Seed script fails
- Run seed script from Render Shell
- Check if tables already exist (script handles duplicates)
- Verify MongoDB connection

## Alternative Deployment Platforms

### Railway (Backend)
Similar to Render:
1. Create Railway account
2. Deploy from GitHub
3. Set environment variables
4. Railway automatically detects Node.js projects

### Netlify (Frontend)
Similar to Vercel:
1. Create Netlify account
2. Deploy from GitHub
3. Configure build settings
4. Set environment variables

## Environment Variables Summary

### Backend (.env)
```
PORT=5000 (or 10000 for Render)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Security Notes

- Never commit `.env` files to Git
- Use strong, randomly generated JWT secrets
- Use strong admin passwords
- Consider adding rate limiting for production
- Enable MongoDB Atlas IP whitelisting for production
