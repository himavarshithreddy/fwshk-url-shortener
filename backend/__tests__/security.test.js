const { proxyDetection, getClientIp, isDataCenterIp, rateLimitKeyGenerator } = require('../middleware/security');

describe('getClientIp', () => {
  test('returns req.ip when available', () => {
    expect(getClientIp({ ip: '1.2.3.4' })).toBe('1.2.3.4');
  });

  test('falls back to socket remoteAddress', () => {
    expect(getClientIp({ socket: { remoteAddress: '5.6.7.8' } })).toBe('5.6.7.8');
  });

  test('returns unknown when no IP available', () => {
    expect(getClientIp({})).toBe('unknown');
  });
});

describe('isDataCenterIp', () => {
  test('detects private/data center IPs', () => {
    expect(isDataCenterIp('10.0.0.1')).toBe(true);
    expect(isDataCenterIp('172.16.0.1')).toBe(true);
    expect(isDataCenterIp('192.168.1.1')).toBe(true);
  });

  test('does not flag public IPs', () => {
    expect(isDataCenterIp('8.8.8.8')).toBe(false);
    expect(isDataCenterIp('1.2.3.4')).toBe(false);
  });

  test('handles IPv4-mapped IPv6', () => {
    expect(isDataCenterIp('::ffff:10.0.0.1')).toBe(true);
    expect(isDataCenterIp('::ffff:8.8.8.8')).toBe(false);
  });

  test('handles null/undefined', () => {
    expect(isDataCenterIp(null)).toBe(false);
    expect(isDataCenterIp(undefined)).toBe(false);
  });
});

describe('proxyDetection', () => {
  function createMockReqResNext(headers = {}) {
    const req = {
      ip: '1.2.3.4',
      headers,
      socket: { remoteAddress: '1.2.3.4' },
    };
    const res = {
      statusCode: null,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    return { req, res, next, wasNextCalled: () => nextCalled };
  }

  test('allows normal requests', () => {
    const { req, res, next, wasNextCalled } = createMockReqResNext();
    proxyDetection(req, res, next);
    expect(wasNextCalled()).toBe(true);
    expect(req.securityMeta).toBeDefined();
    expect(req.securityMeta.clientIp).toBe('1.2.3.4');
  });

  test('blocks requests with too many proxy hops', () => {
    const { req, res, next, wasNextCalled } = createMockReqResNext({
      'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3, 4.4.4.4, 5.5.5.5, 6.6.6.6',
    });
    proxyDetection(req, res, next);
    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  test('flags requests with anonymising headers', () => {
    const { req, res, next, wasNextCalled } = createMockReqResNext({
      via: '1.1 proxy.example.com',
    });
    proxyDetection(req, res, next);
    expect(wasNextCalled()).toBe(true);
    expect(req.securityMeta.proxied).toBe(true);
  });

  test('flags Tor-related headers', () => {
    const { req, res, next } = createMockReqResNext({
      'x-tor-is': 'true',
    });
    proxyDetection(req, res, next);
    expect(req.securityMeta.proxied).toBe(true);
  });

  test('detects data center IPs', () => {
    const { req, res, next } = createMockReqResNext();
    req.ip = '10.0.0.1';
    proxyDetection(req, res, next);
    expect(req.securityMeta.dataCenterIp).toBe(true);
  });
});

describe('rateLimitKeyGenerator', () => {
  test('uses req.ip', () => {
    expect(rateLimitKeyGenerator({ ip: '1.2.3.4' })).toBe('1.2.3.4');
  });
});
