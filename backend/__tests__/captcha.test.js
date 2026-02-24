const { shouldChallenge } = require('../middleware/captcha');

describe('shouldChallenge', () => {
  test('challenges requests with suspicious UA', () => {
    const req = { securityMeta: { suspiciousUA: true } };
    expect(shouldChallenge(req)).toBe(true);
  });

  test('challenges proxied requests', () => {
    const req = { securityMeta: { proxied: true } };
    expect(shouldChallenge(req)).toBe(true);
  });

  test('challenges requests with low trust score', () => {
    const req = { securityMeta: { trustScore: 30 } };
    expect(shouldChallenge(req)).toBe(true);
  });

  test('does not challenge normal requests', () => {
    const req = { securityMeta: { suspiciousUA: false, proxied: false, trustScore: 80 } };
    expect(shouldChallenge(req)).toBe(false);
  });

  test('does not challenge when no security metadata', () => {
    const req = {};
    expect(shouldChallenge(req)).toBe(false);
  });
});
