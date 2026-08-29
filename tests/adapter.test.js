import { describe, it } from 'node:test';
import assert from 'node:assert';
import { adaptMarketEnvelope, formatMarketData } from '../src/adapters/marketAdapter.js';

describe('adapter: adaptMarketEnvelope', () => {
    it('accepts a valid envelope with market, summary, and status', () => {
        const raw = {
            market: 'US',
            summary: { volume: 1000000, gainers: 42, losers: 30 },
            status: { open: true, session: 'regular' },
        };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.error, null);
        assert.deepStrictEqual(result.data, raw);
    });

    it('accepts null status', () => {
        const raw = {
            market: 'US',
            summary: { volume: 500000 },
            status: null,
        };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.data.status, null);
    });

    it('rejects a non-object envelope', () => {
        const result = adaptMarketEnvelope(null);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('object'));
        assert.strictEqual(result.data, null);
    });

    it('rejects missing market field', () => {
        const raw = { summary: { a: 1 }, status: null };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('market'));
    });

    it('rejects invalid market type', () => {
        const raw = { market: 123, summary: { a: 1 }, status: null };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('market'));
    });

    it('rejects missing summary field', () => {
        const raw = { market: 'US', status: null };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('summary'));
    });

    it('rejects array summary', () => {
        const raw = { market: 'US', summary: [1, 2, 3], status: null };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('summary'));
    });

    it('rejects string status', () => {
        const raw = { market: 'US', summary: { a: 1 }, status: 'open' };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('status'));
    });

    it('rejects array status', () => {
        const raw = { market: 'US', summary: { a: 1 }, status: [1, 2] };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('status'));
    });

    it('rejects an envelope with extra fields but still accepts it (no strict rejection)', () => {
        const raw = {
            market: 'US',
            summary: { a: 1 },
            status: null,
            extra: 'should be ignored',
        };
        const result = adaptMarketEnvelope(raw);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.data.market, 'US');
    });
});

describe('adapter: formatMarketData', () => {
    it('formats nested objects without [object Object]', () => {
        const data = {
            market: 'US',
            summary: { volume: 1000000, change: { percent: 1.5 } },
            status: { open: true, hours: { start: '09:30', end: '16:00' } },
        };
        const formatted = formatMarketData(data);
        assert.ok(!formatted.includes('[object Object]'));
        assert.ok(formatted.includes('Market: US'));
        assert.ok(formatted.includes('volume: 1000000'));
        assert.ok(formatted.includes('change: {"percent":1.5}'));
        assert.ok(formatted.includes('open: true'));
        assert.ok(formatted.includes('hours: {"start":"09:30","end":"16:00"}'));
    });

    it('formats null status correctly', () => {
        const data = {
            market: 'US',
            summary: { a: 1 },
            status: null,
        };
        const formatted = formatMarketData(data);
        assert.ok(formatted.includes('Status: null'));
    });

    it('formats empty summary and status', () => {
        const data = {
            market: 'US',
            summary: {},
            status: {},
        };
        const formatted = formatMarketData(data);
        assert.ok(formatted.includes('Summary: (empty)'));
        assert.ok(formatted.includes('Status: (empty)'));
    });

    it('formats null values inside objects', () => {
        const data = {
            market: 'US',
            summary: { missing: null },
            status: null,
        };
        const formatted = formatMarketData(data);
        assert.ok(formatted.includes('missing: null'));
    });
});
