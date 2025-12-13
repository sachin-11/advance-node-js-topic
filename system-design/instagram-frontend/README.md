# Instagram Clone Frontend

A modern, responsive frontend for the Instagram clone, built with React, Vite, TypeScript, and TailwindCSS.

## Features

- **Authentication**: Login and Register pages with form validation
- **Feed**: View posts from users you follow
- **Create Post**: Upload photos with captions
- **Profile**: View user stats and post grid
- **Responsive Design**: Mobile-friendly layout with sidebar navigation on desktop

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS + clsx
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js v18+
- Backend service running on port 3000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd instagram-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`

## Project Structure

```
src/
├── api/            # Axios client and API functions
├── components/     # Reusable UI components
│   ├── layout/     # Sidebar and structural components
│   └── feed/       # Post related components
├── context/        # React Context (Auth)
├── pages/          # Application pages (Auth, Feed, Profile)
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```
