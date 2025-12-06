# Deployment Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your repository
   - Vercel auto-detects Next.js settings
   - Add environment variables (if using Resend for email):
     - `RESEND_API_KEY=your_key_here`
   - Click "Deploy"
   - Done! Your site is live

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## Deploy to Netlify

1. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Install command: `npm install`

2. **Via Netlify UI:**
   - Connect GitHub repository
   - Netlify auto-detects Next.js
   - Deploy

3. **Via CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

---

## Static Export (GitHub Pages)

1. **Update `next.config.js`:**
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   }
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy `out/` folder to GitHub Pages**

---

## Environment Variables

Create `.env.local` for local development:

```
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, add these in Vercel/Netlify dashboard.

---

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test contact form (check email delivery)
- [ ] Verify all images load
- [ ] Test mobile responsiveness
- [ ] Check SEO meta tags
- [ ] Verify gallery lightbox works
- [ ] Test navigation links
- [ ] Check Google Analytics (if added)

