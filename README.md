# Store Manager - Simple Store Management System

A comprehensive convenience store management system for tracking sales, customer dues, inventory, and business expenses with detailed visual reports.

## Features

- **Dashboard**: Quick stats, recent transactions, quick actions
- **Product Management**: Add, edit, delete products with inventory tracking
- **Customer Management**: Customer profiles with due balance tracking
- **Sales Module**: Create sales with cash or due payment options
- **Expenses Tracking**: Track business expenses by category
- **Visual Reports**: Daily, weekly, monthly, yearly charts

## Tech Stack

- Next.js 15 with App Router
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts for visualizations
- Zustand for state management
- localStorage for data persistence

## Deployment Instructions

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Store Manager"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

#### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"
7. Wait for deployment to complete
8. Your app will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy to GitHub Pages (Static Export)

For GitHub Pages, you need to modify `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
```

Then:

1. Run `npm run build` - this creates an `out` folder
2. Push the `out` folder contents to your `gh-pages` branch
3. Enable GitHub Pages in repository settings

---

### Option 3: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

---

## Local Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Data Storage

All data is stored in the browser's localStorage. Data persists across browser sessions but is local to each device/browser.

## License

MIT License
