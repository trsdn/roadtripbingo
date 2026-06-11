/**
 * @jest-environment node
 */

// Importing server.js must not start a real server (guarded by require.main).
const { checkRateLimit, rateLimitMap, RATE_LIMIT_AI_MAX_REQUESTS } =
  require('../../../server.js');

describe('Rate limiter', () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  it('tracks AI and general traffic in separate buckets', () => {
    const ip = '10.0.0.1';
    // Flood the general bucket well past the AI limit
    for (let i = 0; i < RATE_LIMIT_AI_MAX_REQUESTS + 50; i++) {
      checkRateLimit(ip, false);
    }
    // The AI bucket must still be untouched → first AI call allowed
    expect(checkRateLimit(ip, true)).toBe(false);
  });

  it('still enforces the AI limit independently', () => {
    const ip = '10.0.0.2';
    for (let i = 0; i < RATE_LIMIT_AI_MAX_REQUESTS; i++) {
      expect(checkRateLimit(ip, true)).toBe(false);
    }
    // One past the AI limit → blocked
    expect(checkRateLimit(ip, true)).toBe(true);
  });

  it('keeps separate counters per IP', () => {
    for (let i = 0; i < RATE_LIMIT_AI_MAX_REQUESTS; i++) {
      checkRateLimit('10.0.0.3', true);
    }
    // A different IP is unaffected
    expect(checkRateLimit('10.0.0.4', true)).toBe(false);
  });
});
