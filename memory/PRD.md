# Chitrakatha - Photography/Cinematography Business Website

## Original Problem Statement
Build a responsive website with a dashboard page, Gallery page, Service page, and an About Us page using provided assets. Additional requirements include an exclusive Admin panel for dynamic image management (upload, drag-and-drop reorder), a dynamic Hero slideshow, a complex interactive Services page with PDF-based pricing and a cart-like summation feature, and a custom "Meet Our Team" section.

## Architecture
- **Frontend**: React + TailwindCSS + Framer Motion + react-beautiful-dnd
- **Backend**: FastAPI + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Theme**: Cinematic Noir (dark theme with red/gold accents)

## What's Implemented
- Full stack application setup (React, FastAPI, MongoDB)
- Exclusive Admin Dashboard (`/admin`) with secure auth middleware
- Dynamic image management: File upload, preview modal, drag-and-drop reordering
- Dynamic Hero slideshow with smooth transitions (Home page)
- Complete Services page with Pre-Wedding, Wedding, Kids sections, interactive summation features, and "Book Now" modal
- Gallery page with filtered categories (Wedding, Pre-Wedding, Portrait, Kids)
- About Us page with Our Story, Stats, Meet Our Team (4 members in single row), Philosophy
- UI/UX: Custom auto-hiding navbar, Cinematic Noir dark theme
- Rounded corners (rounded-xl/rounded-lg) on all cards/boxes across the site
- Hover animations on all interactive cards
- Team member images with `object-top` for face visibility

## Key Pages
1. **Home** (`/`): Hero slideshow, featured work, packages preview, CTA
2. **Gallery** (`/gallery`): Filterable photo gallery by category
3. **Services** (`/services`): Interactive pricing calculator with add-ons and Book Now modal
4. **About** (`/about`): Our Story, Stats, Meet Our Team (4 members), Philosophy
5. **Admin Login** (`/admin`): Exclusive admin access
6. **Admin Dashboard** (`/admin/dashboard`): Image management, gallery CRUD, reordering

## Team Members (About Page)
1. Upasak Mukherjee - Cinematographer & Photographer
2. Deep Shekhar Ojha - Candid & Wide Photographer
3. Debraj Roy - Candid & Portrait Photographer
4. Sandip Pal - Cinematographer

## API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login
- `GET /api/site-images` - Get site images
- `GET /api/gallery` - Get gallery items
- `POST /api/admin/upload-image` - Upload image
- `PUT /api/admin/gallery/reorder` - Reorder gallery
- `DELETE /api/admin/gallery/{item_id}` - Delete gallery item

## Backlog / Future Tasks
- **P1**: Comprehensive mobile responsiveness testing
- **P2**: Performance optimization (image lazy loading, compression)
- **P2**: SEO improvements (meta tags, sitemap)
