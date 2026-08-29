import { describe, it } from 'node:test';
import assert from 'node:assert';
import { matchTicker } from './tickerSearch.js';

describe('matchTicker', () => {
  it('returns true for exact ticker match', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'AAPL'), true);
  });

  it('returns true for exact name match', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'Apple Inc.'), true);
  });

  it('is case-insensitive for ticker and query', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'aapl'), true);
    assert.strictEqual(matchTicker({ ticker: 'aapl', name: 'Apple Inc.' }, 'AAPL'), true);
  });

  it('is case-insensitive for name and query', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'apple inc.'), true);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'apple inc.' }, 'Apple Inc.'), true);
  });

  it('trims whitespace from the query', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '  AAPL  '), true);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '  Apple  '), true);
  });

  it('returns false when ticker is missing or null', () => {
    assert.strictEqual(matchTicker({ name: 'Apple Inc.' }, 'AAPL'), false);
    assert.strictEqual(matchTicker({ ticker: null, name: 'Apple Inc.' }, 'AAPL'), false);
  });

  it('returns false when name is missing or null', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL' }, 'Apple'), false);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: null }, 'Apple'), false);
  });

  it('returns false for empty query', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, ''), false);
  });

  it('returns false for whitespace-only query', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '   '), false);
  });

  it('returns false for non-matching query', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'GOOG'), false);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'Microsoft'), false);
  });

  it('returns false when stock is null or undefined', () => {
    assert.strictEqual(matchTicker(null, 'AAPL'), false);
    assert.strictEqual(matchTicker(undefined, 'AAPL'), false);
  });

  it('returns false when query is not a string', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, null), false);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, undefined), false);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 123), false);
  });

  it('matches partial substrings', () => {
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'App'), true);
    assert.strictEqual(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'AAP'), true);
  });
});
