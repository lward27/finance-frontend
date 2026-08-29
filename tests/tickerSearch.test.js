import assert from 'node:assert/strict';
import test from 'node:test';

import { matchTicker } from '../src/utils/tickerSearch.js';

test('exact ticker match', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'AAPL'), true);
});

test('exact name match', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'Apple'), true);
});

test('case-insensitive matching', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'aapl'), true);
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'APPLE'), true);
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'inc'), true);
});

test('trimmed query handling', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '  AAPL  '), true);
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '  Apple  '), true);
});

test('missing ticker field', () => {
  assert.equal(matchTicker({ name: 'Apple Inc.' }, 'AAPL'), false);
  assert.equal(matchTicker({ name: 'Apple Inc.' }, 'Apple'), true);
});

test('missing name field', () => {
  assert.equal(matchTicker({ ticker: 'AAPL' }, 'Apple'), false);
  assert.equal(matchTicker({ ticker: 'AAPL' }, 'AAPL'), true);
});

test('null ticker field', () => {
  assert.equal(matchTicker({ ticker: null, name: 'Apple Inc.' }, 'AAPL'), false);
  assert.equal(matchTicker({ ticker: null, name: 'Apple Inc.' }, 'Apple'), true);
});

test('null name field', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: null }, 'Apple'), false);
  assert.equal(matchTicker({ ticker: 'AAPL', name: null }, 'AAPL'), true);
});

test('empty query returns false', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, ''), false);
});

test('whitespace-only query returns false', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '   '), false);
});

test('non-matching query returns false', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'GOOG'), false);
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'Microsoft'), false);
});

test('null stock returns false', () => {
  assert.equal(matchTicker(null, 'AAPL'), false);
});

test('undefined stock returns false', () => {
  assert.equal(matchTicker(undefined, 'AAPL'), false);
});

test('non-string query returns false', () => {
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 123), false);
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, null), false);
  assert.equal(matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, undefined), false);
});

test('partial substring match', () => {
  assert.equal(matchTicker({ ticker: 'GOOGL', name: 'Alphabet Inc.' }, 'GOO'), true);
  assert.equal(matchTicker({ ticker: 'GOOGL', name: 'Alphabet Inc.' }, 'Alphabet'), true);
  assert.equal(matchTicker({ ticker: 'GOOGL', name: 'Alphabet Inc.' }, 'bet'), true);
});
