# Fwshk - URL Shortener

A fast, minimal URL shortener built with Express.js, React, and Upstash Redis. Shorten URLs with custom or auto-generated codes, track click counts, and deploy seamlessly on Vercel.

## Features

- **Shorten URLs** with random or custom short codes
- **Track clicks** on shortened URLs
- **Custom codes** – alphanumeric and hyphens, up to 20 characters
- **Serverless** – deploys on Vercel with Upstash Redis

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | ✅ | Your Upstash Redis REST API URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Your Upstash Redis REST API token |
| `PORT` | ❌ | Server port (default: `3001`) |

### Frontend

Set these in your hosting platform (e.g., Vercel) or in a local `.env` file:

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | ❌ | Backend API URL. Leave empty if frontend and backend share the same origin. |
| `REACT_APP_BASE_URL` | ❌ | Base URL shown in shortened links. Defaults to `window.location.origin`. |

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # Fill in your Upstash credentials
npm install
npm start

# Frontend (separate terminal)
cd frontend
cp .env.example .env   # Optionally configure API/base URLs
npm install
npm start
```

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) in the Vercel project settings
4. Deploy – Vercel uses `vercel.json` to route all requests to the backend

## Migrating to a New Domain

When changing your hosted URL (e.g., from `old-domain.vercel.app` to `new-domain.com`):

1. **Update your domain** in Vercel (Settings → Domains) or your DNS provider
2. **Set `REACT_APP_BASE_URL`** to your new domain (e.g., `https://new-domain.com`) in Vercel environment variables, then redeploy
3. **No backend changes needed** – Redis data persists across deployments, so all existing short links remain valid
4. **Old domain links** will stop working unless you set up a redirect from the old domain to the new one

## Project Structure

```
├── backend/
│   ├── controllers/linkController.js   # Route handlers
│   ├── models/Link.js                  # Redis data layer
│   ├── routes/linkRoutes.js            # Express routes
│   └── server.js                       # Entry point
├── frontend/
│   └── src/
│       ├── App.js                      # Router setup
│       ├── Main.js                     # URL shortener form
│       └── Track.js                    # Click tracking page
└── vercel.json                         # Vercel deployment config
```

## Next Steps / Roadmap

- [ ] Add link expiration (TTL) support
- [ ] Add QR code generation for shortened URLs
- [ ] Add analytics dashboard (clicks over time, referrers)
- [ ] Add user authentication for managing links
- [ ] Add bulk URL shortening
- [ ] Add API rate limiting for production use

## License

[MIT](LICENSE)
