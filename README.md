# Testimonial Studio

A full-stack testimonial poster designer and export studio built with **React**, **TypeScript**, **Tailwind CSS**, **Express**, and **MongoDB Atlas**. Design publication-ready client testimonial posters from three master templates, customize typography, branding, photos, signatures, and color themes in real time, save projects per account in MongoDB, and export crisp high-resolution **PNG**, **JPG**, and **PDF** files.

---

## Key Features

### 1. Three Master Reference Templates (`800 × 1200 px` · 2:3 Portrait)
- **Luxury Gold (`template-1`)**: Canvas-painted ivory & pale-blue wash field, anti-aliased top-left metallic ribbon, vector 3D testimonial banner (`Template1RibbonBanner`), highlighted recommendation panel, custom bottom wave SVG (`Template1BottomWaveSvg`) with clipped/faded showcase photo, and optional signature.
- **Elegant Minimal (`template-2`)**: Dynamic SVG gold-framed background (`Template2Background`), script testimonial heading with gold divider rules, large quotation marks, clean multi-line body typography, author/company metadata, and script "Thank you" closing.
- **Corporate Classic (`template-3`)**: Vector navy & gold swoosh geometry (`Template3Background`), structured quotation card, optional background watermark image slot, structured footer attribution, and corporate typography.

### 2. Visual Editor & Image Tools
- **Live Split-Pane Studio**: Content editor ([`LeftPanel`](src/components/editor/LeftPanel.tsx)), interactive zoomed poster canvas ([`CenterCanvas`](src/components/editor/CenterCanvas.tsx)), styling & element inspector ([`RightPanel`](src/components/editor/RightPanel.tsx)), and undo/redo + save/export toolbar ([`CanvasToolbar`](src/components/editor/CanvasToolbar.tsx)).
- **Image Upload & Cropper**: Upload left/right logos, author signature, supporting photo, or watermark with built-in aspect ratio cropping (`free`, `1:1`, `3:1`, `16:9`, `2:3`) and zoom via [`ImageCropModal`](src/components/editor/ImageCropModal.tsx).
- **Theme & Typography Customization**: Google Fonts (`Spectral`, `Playfair Display`, `Cinzel`, `Montserrat`, `Inter`, `Alex Brush`, `Great Vibes`, `Caveat`, `Dancing Script`), per-field font sizes, primary/gold/accent colors, and per-element color overrides.
- **Responsive Experience**: Full desktop 3-pane studio plus mobile/tablet navigation ([`Sidebar`](src/components/layout/Sidebar.tsx), [`MobileBottomNav`](src/components/layout/MobileBottomNav.tsx), and tabbed `Preview` / `Content` / `Style` controls on small screens).

### 3. Clean High-Resolution Export Pipeline
- Renders from an offscreen unscaled `#testimonial-clean-export-target` with `isExporting={true}` (automatically excluding selection borders, hover rings, and dashed upload placeholders).
- Waits for `document.fonts.ready` before rasterization via `html-to-image` & `jsPDF`:
  - **Formats**: `PNG Image` (Lossless HD), `JPG Image` (`0.95` quality), `PDF Document` (`200mm × 300mm`, 2:3 Print Ready).
  - **Resolutions**: `1x (800 × 1200)`, `2x (1600 × 2400)`, and `3x (2400 × 3600)`.
- Increments the authenticated user's persisted `downloadCount` in MongoDB and optionally marks the project status as `Completed`.

### 4. Authentication & Cloud Project Management
- **Mobile + Password Accounts**: Sign up and sign in using normalized mobile number + password (`crypto.scryptSync` salted hashes, timing-safe comparison).
- **Session Security**: HS256-signed JWT stored in an `HttpOnly` cookie (`ts_session`), server-side token revocation on sign-out (`RevokedToken` TTL model), auth rate limiting, strict CSP/security headers, and CORS origin allowlisting.
- **Workspace Dashboard**: Live scaled poster previews ([`DesignThumbnailPreview`](src/components/common/DesignThumbnailPreview.tsx)), `Draft` ↔ `Completed` status toggle, search/filter tabs in `My Designs`, sample project reset/seeding, and profile download analytics.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Lucide React
- **Canvas & Export**: `html-to-image`, `jsPDF`, Fabric.js
- **Backend**: Node.js (ESM), Express 4, CORS, `dotenv`
- **Database**: MongoDB Atlas & Mongoose 8

---

## Project Structure

```text
├── .github/workflows/
│   └── deploy-pages.yml          # Automated GitHub Pages frontend deployment
├── public/
│   └── templates/                # Static template preview thumbnails & assets
├── references/                   # Reference template artwork
├── server/
│   ├── middleware/
│   │   ├── auth.js               # Require DB & verify JWT + revocation status
│   │   └── rateLimit.js          # In-memory sliding/fixed-window rate limiters
│   ├── models/
│   │   ├── Design.js             # User testimonial designs schema (draft/completed)
│   │   ├── RevokedToken.js       # Sign-out JWT revocation list with TTL index
│   │   └── User.js               # Mobile auth credentials & downloadCount
│   ├── routes/
│   │   ├── auth.js               # /api/auth/* (signup, signin, signout, session, me, downloads)
│   │   └── designs.js            # /api/designs/* (CRUD, seed, status)
│   ├── utils/
│   │   └── auth.js               # Password hashing, JWT sign/verify, cookie & mobile utils
│   ├── dev.js                    # Unified dev runner (API + Vite client)
│   ├── index.js                  # Express API server (+ optional static dist hosting)
│   └── package.json
├── src/
│   ├── components/
│   │   ├── auth/                 # Mobile sign-in / account creation screen
│   │   ├── common/               # DesignThumbnailPreview & ModalHost
│   │   ├── dashboard/            # DashboardView, TemplatesView, MyDesignsView, SettingsView
│   │   ├── editor/               # CanvasToolbar, LeftPanel, CenterCanvas, RightPanel, Modals
│   │   ├── layout/               # Sidebar & MobileBottomNav
│   │   └── templates/            # Template1LuxuryGold, Template2ElegantMinimal, Template3CorporateClassic
│   ├── data/
│   │   └── defaultTemplates.ts   # Master template defaults & sample starter data
│   ├── store/
│   │   ├── useModalStore.ts      # Global alert/confirm modal state
│   │   └── useStudioStore.ts     # Zustand auth, design, editor & undo/redo store
│   ├── types/
│   │   └── studio.ts             # Shared TypeScript interfaces
│   ├── utils/
│   │   ├── colorUtils.ts         # Color brightness & metallic gradient generation
│   │   ├── exportUtils.ts        # html-to-image & jsPDF export pipeline
│   │   ├── fabricTemplates.ts    # Fabric.js canvas helpers
│   │   ├── imageUtils.ts         # FileReader & offscreen crop canvas utilities
│   │   ├── router.ts             # Pathname/hash routing + BASE_URL asset resolution
│   │   └── storageApi.ts         # Typed fetch client for /api/auth & /api/designs
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example                  # Environment variable template
├── index.html
├── package.json
├── render.yaml                   # Render Web Service blueprint for server/
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
npm run install:server
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the project root and fill in your credentials:
```env
MONGODB_URI=mongodb+srv://<username>:<db_password>@cluster0.xxxxx.mongodb.net/testimonial-studio?appName=Cluster0
PORT=5000
JWT_SECRET=your-long-32-plus-character-random-secret
```

> Make sure your current IP address (or `0.0.0.0/0` for cloud hosting) is allowed in **MongoDB Atlas → Network Access**.

### 3. Run Frontend + Backend Together
```bash
npm run dev
```
- Frontend dev server: `http://localhost:5173` (proxies `/api/*` to Express)
- Backend API server: `http://127.0.0.1:5000`

### 4. Production Build Check
```bash
npm run build
```

---

## Deploying Backend on Render + Frontend on GitHub Pages

### Step 1: Deploy Backend (`server/`) to Render
1. Go to **Render Dashboard → New → Blueprint** (or **New Web Service**) and connect `Manuen-Infotech-OPC-Private-Limited/Testimonial-Studio`.
2. If creating manually instead of via [`render.yaml`](render.yaml):
   - **Root Directory**: `server`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
3. Configure **Environment Variables** on Render:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = strong random string (`>= 32` characters)
   - `ALLOWED_ORIGINS` = `https://manuen-infotech-opc-private-limited.github.io` *(origin only — no trailing slash or `/Testimonial-Studio` path)*
4. After deployment completes, copy your Render service URL (for example: `https://testimonial-studio-api.onrender.com`) and verify `https://<your-service>.onrender.com/api/health` returns `{"ok":true,"dbConnected":true,"status":"connected"}`.

### Step 2: Deploy Frontend (`dist/`) to GitHub Pages
1. In your GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Open **Settings → Secrets and variables → Actions → Variables** and add:
   - **`VITE_API_URL`** = `https://<your-render-service>.onrender.com` *(no trailing slash)*
3. Push to `main` (or trigger **Actions → Deploy Frontend to GitHub Pages → Run workflow**).
4. [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) automatically builds with `VITE_BASE_PATH="/Testimonial-Studio/"` and emits `dist/404.html` SPA fallback routing so clean deep URLs (`/Testimonial-Studio/editor/template-1`), refreshes, and `/templates/*.png` assets work on GitHub Pages without `#` hashes.

> **Browser cookie note for cross-domain hosting:** When the frontend is on `*.github.io` and the backend is on `*.onrender.com`, the server sets `SameSite=None; Secure; HttpOnly` cookies automatically over HTTPS. Standard Chrome, Edge, and Firefox windows support this; browsers/modes that block all third-party cookies (such as Safari ITP or Incognito with third-party cookie blocking) require hosting frontend and API under the same custom parent domain (or serving `dist/` directly from Render).
