# Jaydip Suthar Photography Portfolio

A modern, responsive photography portfolio website built with Next.js 14 and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, professional design with smooth animations
- **Responsive**: Fully responsive across all devices
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Gallery Lightbox**: Interactive image gallery with lightbox carousel
- **Contact Form**: Serverless contact form integration
- **Fast Performance**: Optimized with Next.js Image component

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🛠️ Installation

1. **Clone or navigate to the project:**
   ```bash
   cd jaydip-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
jaydip-portfolio/
├── public/
│   ├── assets/          # Images and media files
│   │   ├── hero-image.jpg
│   │   ├── about/
│   │   ├── gallery/
│   │   ├── process/
│   │   └── services/
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── pricing/
│   │   ├── services/
│   │   ├── terms/
│   │   ├── process/
│   │   ├── post-production/
│   │   ├── how-to-book/
│   │   ├── api/
│   │   │   └── contact/   # API route for contact form
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       ├── Navigation.tsx
│       ├── Footer.tsx
│       └── GalleryLightbox.tsx
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🖼️ Adding Images

1. **Extract images from PDF or prepare your images**

2. **Organize images in `public/assets/`:**
   ```
   public/assets/
   ├── hero-image.jpg
   ├── about/
   │   └── jaydip.jpg
   ├── gallery/
   │   ├── wedding-1.jpg
   │   ├── wedding-2.jpg
   │   ├── pre-wedding-1.jpg
   │   ├── engagement-1.jpg
   │   ├── family-1.jpg
   │   ├── family-2.jpg
   │   ├── maternity-1.jpg
   │   ├── portrait-1.jpg
   │   ├── lifestyle-1.jpg
   │   ├── lifestyle-2.jpg
   │   ├── model-1.jpg
   │   └── model-2.jpg
   ├── process/
   │   ├── step-1.jpg
   │   ├── step-2.jpg
   │   ├── step-3.jpg
   │   └── step-4.jpg
   └── services/
       ├── wedding.jpg
       ├── portrait.jpg
       └── lifestyle.jpg
   ```

3. **Replace placeholder images:**
   - Update image paths in components to match your file structure
   - Ensure all images are optimized (JPEG/WebP format recommended)
   - Recommended dimensions:
     - Hero: 1920x1080px
     - Gallery: 800x600px minimum
     - Service thumbnails: 600x400px

## ⚙️ Configuration

### Contact Form Email

The contact form currently logs submissions to console. To enable email sending:

1. **Using Resend (Recommended):**
   ```bash
   npm install resend
   ```

   Update `src/app/api/contact/route.ts`:
   ```typescript
   import { Resend } from 'resend'
   
   const resend = new Resend(process.env.RESEND_API_KEY)
   
   await resend.emails.send({
     from: 'contact@yourdomain.com',
     to: 'thejdfilmer@gmail.com',
     subject: `New Contact: ${service || 'General'}`,
     html: `...`
   })
   ```

   Add to `.env.local`:
   ```
   RESEND_API_KEY=your_api_key_here
   ```

2. **Alternative: Use Netlify Forms** (if deploying to Netlify)
   - Add `netlify` attribute to form
   - No backend needed

3. **Alternative: mailto: fallback**
   - Already implemented as backup option

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js
   - Add environment variables if using Resend
   - Click "Deploy"
   - Your site will be live!

### Deploy to Netlify

1. **Build command:** `npm run build`
2. **Publish directory:** `.next`
3. **Install command:** `npm install`

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Static Export (GitHub Pages)

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

## 📝 Customization

### Update Content
- Edit page files in `src/app/` for content changes
- Update metadata in `src/app/layout.tsx` for SEO

### Change Colors
- Edit `tailwind.config.js` for theme colors
- Update `src/app/globals.css` for custom styles

### Add Pages
- Create new folders in `src/app/`
- Add `page.tsx` files following Next.js App Router structure

## 🔧 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📞 Support

For issues or questions:
- Email: thejdfilmer@gmail.com
- Phone: +91 9898332286 / +91 9998332286

## 📄 License

This project is private and proprietary.

---

**Built with Next.js 14 and Tailwind CSS**

