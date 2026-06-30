# brnk — Simple URL Shortener

A fast, lightweight, and minimalistic full-stack URL shortener and QR code generator.

## Tech Stack

- **Frontend:** Next.js, React, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** Upstash Redis
- **Deployment:** Vercel

## Features

- Shorten long URLs with a single click.
- Generate high-quality, branded QR codes for any link.
- Advanced features: 
  - Custom short codes
  - Link expiration (TTL)
  - Self-destructing links (max 1 click)
  - Password protection
  - Redirect type selection (301, 302, 308)
- Real-time click tracking and analytics (Device and Geo stats).

## Development

### Setup

Make sure you have Node.js installed.

1. Clone the repository.
2. Setup the backend:
   ```bash
   cd backend
   npm install
   # Copy .env.example to .env and configure your Redis credentials
   npm start
   ```

3. Setup the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables

See `backend/.env.example` and `frontend/.env.local` for required environment variables.

## Deployment

This project is configured to be deployed on Vercel. 
- Ensure that the Root Directory is set to `frontend` in your Vercel project settings, or configure it as a monorepo.
- The Next.js frontend is configured to automatically rewrite API requests to the backend.

---
Built with ❤️ by brnk.
