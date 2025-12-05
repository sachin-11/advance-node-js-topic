# Sachin Singh - Portfolio Website

A modern, responsive single-page portfolio website built with React, Vite, and Tailwind CSS. Features a dark theme with teal accents, showcasing professional experience, projects, and skills.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```
   The optimized build will be in the `dist` folder.

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
portfolio-app/
├── public/
│   └── resume.pdf          # Your resume PDF (add your actual resume here)
├── src/
│   ├── components/
│   │   ├── Hero.jsx        # Hero section with CTA
│   │   ├── About.jsx       # About section with skills
│   │   ├── Experience.jsx  # Work experience timeline
│   │   ├── ProjectsGrid.jsx # Projects showcase
│   │   └── Contact.jsx     # Contact information
│   ├── data/
│   │   └── projects.json   # Projects data
│   ├── App.jsx             # Main app component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.cjs    # Tailwind configuration
└── postcss.config.cjs     # PostCSS configuration
```

## 🎨 Features

- **Dark Theme**: Modern dark UI with teal accent colors
- **Responsive Design**: Works seamlessly on all devices
- **Accessible**: Keyboard navigation and focus states
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Fast Loading**: Optimized with Vite
- **Download Resume**: Direct PDF download functionality

## 📝 Adding Your Resume

1. Place your resume PDF file in the `public/` folder
2. Name it `resume.pdf`
3. The "Download Resume" button will automatically work

## 🚀 Deployment

### Deploy to Vercel (Recommended - One Click)

**📖 Detailed Hindi/English Guide:** See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for step-by-step instructions.

**Quick Steps:**

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (free)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - Click "Deploy"
   - Your site will be live in seconds! 🎉

**For detailed step-by-step guide in Hindi/English, see:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

### Deploy to GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js:**
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/' // Replace with your repo name
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

## 📱 Sections

1. **Hero** - Introduction with download resume CTA
2. **About** - Professional summary, skills, and education
3. **Experience** - Detailed work history
4. **Projects** - Showcase of key projects
5. **Contact** - Contact information and location

## 🎯 Customization

### Change Colors
Edit `tailwind.config.cjs` to modify the color scheme.

### Update Projects
Edit `src/data/projects.json` to add or modify projects.

### Modify Content
Update component files in `src/components/` to change text and information.

## 📄 License

This project is open source and available for personal use.

## 👤 Author

**Sachin Singh**
- Email: rajeshsachin786@gmail.com
- Phone: +91 7041200380
- Location: Prayag Raj, Uttar Pradesh, India

---

Made with ❤️ using React and Vite

