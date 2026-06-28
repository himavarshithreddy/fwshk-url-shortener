/**
 * Intelligent CAPTCHA middleware using reCAPTCHA v3.
 * Only triggers verification when the request is suspicious
 * (high velocity, suspicious IP/UA, low trust score).
 */

const CAPTCHA_SCORE_THRESHOLD = parseFloat(process.env.CAPTCHA_SCORE_THRESHOLD) || 0.5;

/**
 * Determine whether this request should be challenged with CAPTCHA.
 */
function shouldChallenge(req) {
  const meta = req.securityMeta || {};

  // Suspicious user-agent
  if (meta.suspiciousUA) return true;

  // Flagged as proxied
  if (meta.proxied) return true;

  // Low trust score on the URL
  if (typeof meta.trustScore === 'number' && meta.trustScore < 50) return true;

  return false;
}

/**
 * Express middleware for reCAPTCHA v3 verification.
 * Active only when RECAPTCHA_SECRET_KEY is configured.
 * Challenges only suspicious requests to preserve UX.
 */
async function captchaVerification(req, res, next) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return next(); // Not configured — skip

  // Only challenge suspicious requests
  if (!shouldChallenge(req)) return next();

  const captchaToken = req.body.captchaToken || req.headers['x-captcha-token'];

  if (!captchaToken) {
    return res.status(403).json({
      error: 'CAPTCHA verification required. Please complete the CAPTCHA challenge.',
      captchaRequired: true,
    });
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: captchaToken,
      remoteip: req.securityMeta?.clientIp || req.ip || '',
    });

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();

      if (!data.success || data.score < CAPTCHA_SCORE_THRESHOLD) {
        return res.status(403).json({
          error: 'CAPTCHA verification failed. Please try again.',
          captchaRequired: true,
        });
      }
    }
    // If API call fails, allow through (fail open for availability)
  } catch {
    // Fail open — don't block users if reCAPTCHA API is unreachable
  }

  next();
}

module.exports = {
  captchaVerification,
  shouldChallenge,
};
