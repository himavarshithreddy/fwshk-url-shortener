/**
 * Real-time monitoring, anomaly detection, and abuse kill switch.
 * Tracks link creation rates, redirect volumes, flagged links,
 * and automatically disables link creation under attack.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// --- Kill switch thresholds ---
const MALICIOUS_LINK_THRESHOLD = parseInt(process.env.KILLSWITCH_MALICIOUS_THRESHOLD, 10) || 10;
const MALICIOUS_WINDOW_MS = parseInt(process.env.KILLSWITCH_WINDOW_MS, 10) || (5 * MINUTE);
const KILLSWITCH_COOLDOWN_MS = parseInt(process.env.KILLSWITCH_COOLDOWN_MS, 10) || (15 * MINUTE);
const ANOMALY_CLICKS_THRESHOLD = parseInt(process.env.ANOMALY_CLICKS_THRESHOLD, 10) || 10000;
const ANOMALY_CLICKS_WINDOW_MS = parseInt(process.env.ANOMALY_CLICKS_WINDOW_MS, 10) || (5 * MINUTE);

// --- In-memory state ---
const stats = {
  linksCreatedPerMinute: [],        // timestamps of link creations
  linksCreatedPerHour: [],
  flaggedLinks: [],                 // { shortCode, url, reason, timestamp }
  topDomains: new Map(),            // domain -> count
  redirectsPerLink: new Map(),      // shortCode -> [timestamps]
  creationsByIp: new Map(),         // ip -> [timestamps]
  killSwitchActive: false,
  killSwitchActivatedAt: 0,
  maliciousLinksWindow: [],         // timestamps of rejected malicious URLs
};

const MAX_FLAGGED_LINKS = 1000;
const MAX_REDIRECT_TRACKING = 10000;

/**
 * Record a link creation event.
 */
function recordLinkCreation(shortCode, originalUrl, ip) {
  const now = Date.now();

  stats.linksCreatedPerMinute.push(now);
  stats.linksCreatedPerHour.push(now);

  // Track domain
  try {
    const domain = new URL(originalUrl).hostname.toLowerCase();
    stats.topDomains.set(domain, (stats.topDomains.get(domain) || 0) + 1);
  } catch { /* ignore parse errors */ }

  // Track per-IP creation for anomaly detection
  if (!stats.creationsByIp.has(ip)) {
    stats.creationsByIp.set(ip, []);
  }
  stats.creationsByIp.get(ip).push(now);
}

/**
 * Record a redirect (click) event.
 */
function recordRedirect(shortCode) {
  const now = Date.now();
  if (!stats.redirectsPerLink.has(shortCode)) {
    if (stats.redirectsPerLink.size >= MAX_REDIRECT_TRACKING) {
      const firstKey = stats.redirectsPerLink.keys().next().value;
      stats.redirectsPerLink.delete(firstKey);
    }
    stats.redirectsPerLink.set(shortCode, []);
  }
  stats.redirectsPerLink.get(shortCode).push(now);
}

/**
 * Record a flagged/rejected link.
 */
function recordFlaggedLink(url, reason) {
  const now = Date.now();
  stats.flaggedLinks.push({ url, reason, timestamp: new Date(now).toISOString() });
  if (stats.flaggedLinks.length > MAX_FLAGGED_LINKS) {
    stats.flaggedLinks.shift();
  }

  // Track for kill switch
  stats.maliciousLinksWindow.push(now);

  // Check if kill switch should activate
  checkKillSwitch(now);
}

/**
 * Check if the global kill switch should activate.
 */
function checkKillSwitch(now) {
  // Prune old entries
  stats.maliciousLinksWindow = stats.maliciousLinksWindow.filter(
    t => now - t < MALICIOUS_WINDOW_MS
  );

  if (stats.maliciousLinksWindow.length >= MALICIOUS_LINK_THRESHOLD && !stats.killSwitchActive) {
    stats.killSwitchActive = true;
    stats.killSwitchActivatedAt = now;
    console.warn(`[KILL SWITCH] Activated at ${new Date(now).toISOString()} — ${stats.maliciousLinksWindow.length} malicious links in window`);
  }
}

/**
 * Check if the kill switch should auto-deactivate (cooldown expired).
 */
function isKillSwitchActive() {
  if (!stats.killSwitchActive) return false;
  const now = Date.now();
  if (now - stats.killSwitchActivatedAt > KILLSWITCH_COOLDOWN_MS) {
    stats.killSwitchActive = false;
    stats.killSwitchActivatedAt = 0;
    console.info(`[KILL SWITCH] Deactivated at ${new Date(now).toISOString()} — cooldown expired`);
    return false;
  }
  return true;
}

/**
 * Detect anomalies: single link getting rapid clicks (possible phishing).
 */
function detectClickAnomaly(shortCode) {
  const now = Date.now();
  const clicks = stats.redirectsPerLink.get(shortCode);
  if (!clicks) return false;

  const recentClicks = clicks.filter(t => now - t < ANOMALY_CLICKS_WINDOW_MS);
  return recentClicks.length >= ANOMALY_CLICKS_THRESHOLD;
}

/**
 * Detect anomalies: sudden spike from one IP.
 */
function detectIpSpike(ip) {
  const now = Date.now();
  const creations = stats.creationsByIp.get(ip);
  if (!creations) return false;

  const recentCreations = creations.filter(t => now - t < MINUTE);
  return recentCreations.length > 10; // More than 10 creations in a minute from one IP
}

/**
 * Express middleware: kill switch enforcement.
 * Blocks all link creation when kill switch is active.
 */
function killSwitchMiddleware(req, res, next) {
  if (isKillSwitchActive()) {
    return res.status(503).json({
      error: 'Link creation is temporarily disabled due to detected abuse. Please try again later.',
    });
  }
  next();
}

/**
 * Get monitoring dashboard data.
 */
function getDashboardData() {
  const now = Date.now();

  // Prune old timestamps
  stats.linksCreatedPerMinute = stats.linksCreatedPerMinute.filter(t => now - t < MINUTE);
  stats.linksCreatedPerHour = stats.linksCreatedPerHour.filter(t => now - t < HOUR);

  // Top domains (sorted by count)
  const topDomains = Array.from(stats.topDomains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([domain, count]) => ({ domain, count }));

  // Top redirected links
  const topRedirects = Array.from(stats.redirectsPerLink.entries())
    .map(([shortCode, clicks]) => ({
      shortCode,
      clicksLast5Min: clicks.filter(t => now - t < 5 * MINUTE).length,
      totalTracked: clicks.length,
    }))
    .sort((a, b) => b.clicksLast5Min - a.clicksLast5Min)
    .slice(0, 20);

  // Flagged links (most recent)
  const recentFlagged = stats.flaggedLinks.slice(-50).reverse();

  return {
    linksCreatedLastMinute: stats.linksCreatedPerMinute.length,
    linksCreatedLastHour: stats.linksCreatedPerHour.length,
    topDomains,
    topRedirects,
    recentFlaggedLinks: recentFlagged,
    killSwitch: {
      active: stats.killSwitchActive,
      activatedAt: stats.killSwitchActivatedAt
        ? new Date(stats.killSwitchActivatedAt).toISOString()
        : null,
    },
    timestamp: new Date(now).toISOString(),
  };
}

/**
 * Periodic cleanup to prevent memory leaks.
 */
function cleanup() {
  const now = Date.now();

  stats.linksCreatedPerMinute = stats.linksCreatedPerMinute.filter(t => now - t < MINUTE);
  stats.linksCreatedPerHour = stats.linksCreatedPerHour.filter(t => now - t < HOUR);

  // Clean up old redirect tracking
  for (const [key, clicks] of stats.redirectsPerLink) {
    const recent = clicks.filter(t => now - t < HOUR);
    if (recent.length === 0) {
      stats.redirectsPerLink.delete(key);
    } else {
      stats.redirectsPerLink.set(key, recent);
    }
  }

  // Clean up old per-IP creation tracking
  for (const [key, times] of stats.creationsByIp) {
    const recent = times.filter(t => now - t < HOUR);
    if (recent.length === 0) {
      stats.creationsByIp.delete(key);
    } else {
      stats.creationsByIp.set(key, recent);
    }
  }

  // Cap top domains map
  if (stats.topDomains.size > 10000) {
    const sorted = Array.from(stats.topDomains.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5000);
    stats.topDomains = new Map(sorted);
  }
}

const cleanupTimer = setInterval(cleanup, 5 * MINUTE);
if (cleanupTimer.unref) cleanupTimer.unref();

/**
 * Graceful shutdown: clear the cleanup timer.
 */
function shutdown() {
  clearInterval(cleanupTimer);
}

module.exports = {
  recordLinkCreation,
  recordRedirect,
  recordFlaggedLink,
  isKillSwitchActive,
  killSwitchMiddleware,
  detectClickAnomaly,
  detectIpSpike,
  getDashboardData,
  shutdown,
  // Exposed for testing
  _stats: stats,
};
