import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildUSMarketUrl } from '../src/services/api.js';

describe('contract: buildUSMarketUrl', () => {
    it('produces the exact path /markets/US with the configured base', () => {
        const base = 'https://yfinance.lucas.engineering';
        const url = buildUSMarketUrl(base);
        assert.strictEqual(url, 'https://yfinance.lucas.engineering/markets/US');
    });

    it('rejects a URL with /api prefix', () => {
        const base = 'https://yfinance.lucas.engineering';
        const wrong = `${base}/api/markets/US`;
        const correct = buildUSMarketUrl(base);
        assert.notStrictEqual(correct, wrong);
        assert.strictEqual(correct, 'https://yfinance.lucas.engineering/markets/US');
    });

    it('uses the exact base without adding /api', () => {
        const base = 'https://yfinance.example.com';
        const url = buildUSMarketUrl(base);
        assert.ok(url.startsWith(base));
        assert.ok(!url.includes('/api/'));
        assert.strictEqual(url, `${base}/markets/US`);
    });

    it('produces a different URL for a different base', () => {
        const url1 = buildUSMarketUrl('https://a.example.com');
        const url2 = buildUSMarketUrl('https://b.example.com');
        assert.notStrictEqual(url1, url2);
        assert.strictEqual(url1, 'https://a.example.com/markets/US');
        assert.strictEqual(url2, 'https://b.example.com/markets/US');
    });
});
