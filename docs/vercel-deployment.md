# Deploying ByteEvolvr on Vercel

This repository is a monorepo with three runnable parts:

- `apps/frontend`: public website and shop UI
- `apps/admin`: admin dashboard UI
- `backend`: Express API server

The two Vite apps can run on Vercel. The current backend is a long-running Express server with Socket.IO, BullMQ workers, and Redis, so it is better deployed to a Node host such as Render, Railway, Fly.io, a VPS, or Docker. After the backend is live, point both Vercel apps to it with `VITE_API_BASE_URL`.

## 1. Push the repo to GitHub

```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

Use your actual branch name if it is not `main`.

## 2. Deploy the public frontend

In Vercel, create a new project from the GitHub repository and set:

- Root Directory: `apps/frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Add these environment variables in Vercel:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Deploy the admin app

Create another Vercel project from the same GitHub repository and set:

- Root Directory: `apps/admin`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Add these environment variables in Vercel:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 4. Deploy the backend separately

The backend needs these environment variables:

```env
NODE_ENV=production
PORT=8080
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_PASSWORD_HASH=replace-with-bcrypt-hash
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
REDIS_URL=your-redis-url
RESEND_API_KEY=your-resend-api-key
```

Backend build/start commands:

```bash
npm install
npm run build -w @byteevolvr/backend
npm run start -w @byteevolvr/backend
```

## 5. Verify after deployment

- Open `https://your-backend-domain.com/api/health`
- Open the Vercel frontend URL and visit `/shop`
- Open the Vercel admin URL and visit `/login`
- Confirm backend CORS includes both Vercel domains in `ALLOWED_ORIGINS`

If you later move the backend URL, update `VITE_API_BASE_URL` in both Vercel projects and redeploy.
