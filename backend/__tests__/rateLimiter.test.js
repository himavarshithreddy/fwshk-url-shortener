const { creationRateLimiter, getSubnet, isSuspiciousUA, _ipBuckets, _subnetBuckets, _violations } = require('../middleware/rateLimiter');

// Helper to create a mock req/res/next
function createMockReqResNext(overrides = {}) {
  const req = {
    ip: '1.2.3.4',
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    securityMeta: { clientIp: '1.2.3.4' },
    ...overrides,
  };
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    set(key, value) { this.headers[key] = value; return this; },
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, wasNextCalled: () => nextCalled };
}

// Clear state between tests
beforeEach(() => {
  _ipBuckets.clear();
  _subnetBuckets.clear();
  _violations.clear();
});

describe('getSubnet', () => {
  test('extracts /24 subnet from IPv4', () => {
    expect(getSubnet('1.2.3.4')).toBe('1.2.3.0/24');
  });

  test('handles IPv4-mapped IPv6', () => {
    expect(getSubnet('::ffff:10.0.0.1')).toBe('10.0.0.0/24');
  });

  test('handles unknown IP', () => {
    expect(getSubnet(null)).toBe('unknown');
  });
});

describe('isSuspiciousUA', () => {
  test('flags empty user-agent', () => {
    expect(isSuspiciousUA('')).toBe(true);
    expect(isSuspiciousUA(null)).toBe(true);
  });

  test('flags bot user-agents', () => {
    expect(isSuspiciousUA('curl/7.68.0')).toBe(true);
    expect(isSuspiciousUA('python-requests/2.28.0')).toBe(true);
    expect(isSuspiciousUA('Scrapy/2.0')).toBe(true);
    expect(isSuspiciousUA('HeadlessChrome')).toBe(true);
  });

  test('allows normal browser user-agents', () => {
    expect(isSuspiciousUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe(false);
    expect(isSuspiciousUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(false);
  });
});

describe('creationRateLimiter', () => {
  test('allows first request', () => {
    const { req, res, next, wasNextCalled } = createMockReqResNext();
    creationRateLimiter(req, res, next);
    expect(wasNextCalled()).toBe(true);
  });

  test('blocks after exceeding per-minute limit', () => {
    // Default is 5 per minute
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = createMockReqResNext();
      creationRateLimiter(req, res, next);
    }

    // 6th request should be blocked
    const { req, res, next, wasNextCalled } = createMockReqResNext();
    creationRateLimiter(req, res, next);
    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(429);
  });

  test('applies stricter limits for suspicious user-agents', () => {
    // Suspicious UA gets 50% of normal limit (floor(5 * 0.5) = 2)
    const ua = 'curl/7.68.0';
    for (let i = 0; i < 2; i++) {
      const { req, res, next } = createMockReqResNext({
        headers: { 'user-agent': ua },
      });
      creationRateLimiter(req, res, next);
    }

    // 3rd request should be blocked
    const { req, res, next, wasNextCalled } = createMockReqResNext({
      headers: { 'user-agent': ua },
    });
    creationRateLimiter(req, res, next);
    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(429);
  });

  test('different IPs have independent limits', () => {
    // Fill up IP 1.2.3.4
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = createMockReqResNext();
      creationRateLimiter(req, res, next);
    }

    // IP 5.6.7.8 should still be allowed
    const { req, res, next, wasNextCalled } = createMockReqResNext({
      ip: '5.6.7.8',
      securityMeta: { clientIp: '5.6.7.8' },
    });
    creationRateLimiter(req, res, next);
    expect(wasNextCalled()).toBe(true);
  });

  test('sets Retry-After header on rate limit', () => {
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = createMockReqResNext();
      creationRateLimiter(req, res, next);
    }

    const { req, res, next } = createMockReqResNext();
    creationRateLimiter(req, res, next);
    expect(res.headers['Retry-After']).toBeDefined();
  });

  test('progressive backoff blocks IP after repeated violations', () => {
    // Trigger violations (3 needed for first block)
    for (let attempt = 0; attempt < 3; attempt++) {
      // Fill up the bucket
      for (let i = 0; i < 5; i++) {
        const { req, res, next } = createMockReqResNext();
        creationRateLimiter(req, res, next);
      }
      // Trigger violation
      const { req, res, next } = createMockReqResNext();
      creationRateLimiter(req, res, next);
      // Clear bucket to allow re-triggering
      _ipBuckets.clear();
      _subnetBuckets.clear();
    }

    // Next request should be blocked by progressive backoff
    const { req, res, next, wasNextCalled } = createMockReqResNext();
    creationRateLimiter(req, res, next);
    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toContain('temporarily blocked');
  });
});
