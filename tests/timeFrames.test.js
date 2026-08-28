import assert from 'node:assert/strict';
import test from 'node:test';

import { TIME_FRAMES, getTimeFrameDays } from '../src/utils/timeFrames.js';

test('TIME_FRAMES exposes the supported labels and day mappings', () => {
  assert.deepEqual(TIME_FRAMES, [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'All', days: null },
  ]);
});

test('getTimeFrameDays resolves each bounded time frame', () => {
  assert.equal(getTimeFrameDays('1W'), 7);
  assert.equal(getTimeFrameDays('1M'), 30);
  assert.equal(getTimeFrameDays('3M'), 90);
  assert.equal(getTimeFrameDays('6M'), 180);
  assert.equal(getTimeFrameDays('1Y'), 365);
});

test('getTimeFrameDays preserves the existing one-year fallback', () => {
  assert.equal(getTimeFrameDays('All'), 365);
  assert.equal(getTimeFrameDays('unknown'), 365);
  assert.equal(getTimeFrameDays(undefined), 365);
});
