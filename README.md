# Fwshk — Free URL Shortener

**Fwshk** is a fast, free online URL shortener. Paste any long link and get a clean, short URL in seconds — no account required. Whether you're sharing on social media, in a message, or in print, Fwshk makes your links cleaner and easier to remember.

## How It Works

1. **Paste your URL** – Drop any long link into the input box.
2. **Customize (optional)** – Choose your own short code, or let Fwshk generate one for you.
3. **Share your short link** – Copy and share your new short URL instantly.
4. **Track clicks** – Visit the tracking page to see how many times your link has been clicked.

## Features

- 🔗 **Instant shortening** – Get a short link in one click, no sign-up needed
- ✏️ **Custom short codes** – Pick a memorable alias for your link (e.g. `fwshk.app/my-link`)
- 📊 **Click tracking** – Monitor how many times your link has been visited
- ⚡ **Lightning fast** – Built on a serverless, globally distributed infrastructure for sub-millisecond redirects

## Configuration

### reCAPTCHA v3 (optional)

The app supports Google reCAPTCHA v3 to protect against automated abuse. reCAPTCHA v3 is invisible to users and only activates server-side verification for suspicious requests.

1. Go to [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) and register a new **reCAPTCHA v3** site.
2. Google will provide two keys:
   - **Site key** — used by the frontend to load the reCAPTCHA widget and obtain tokens.
   - **Secret key** — used by the backend to verify tokens with Google's API.
3. Set the environment variables:
   - **Frontend** (`frontend/.env`): `REACT_APP_RECAPTCHA_SITE_KEY=<your site key>`
   - **Backend** (`backend/.env`): `RECAPTCHA_SECRET_KEY=<your secret key>`

Both keys are required for reCAPTCHA to work. If neither is set, the feature is simply disabled.

### Monitoring Dashboard (optional)

The backend exposes a `GET /monitoring/dashboard` endpoint with real-time stats (link creation rates, flagged links, kill-switch status, etc.).

To protect this endpoint, set `MONITORING_API_KEY` in `backend/.env` to any strong random string of your choice (e.g. a UUID or a generated password). Requests to the dashboard must include the header:

```
x-api-key: <your MONITORING_API_KEY value>
```

If `MONITORING_API_KEY` is left empty, the dashboard endpoint is publicly accessible.

## Use Cases

- Share links on social media without character limits getting in the way
- Make long affiliate or referral URLs presentable
- Create memorable links for marketing campaigns or print materials
- Track engagement on links you share via a dedicated tracking page


## License

[MIT](LICENSE)
