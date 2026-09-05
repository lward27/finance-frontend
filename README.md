# Finance frontend

Use Node 24, matching PHarness's prepared execution environment, and install the
committed npm lock before running the existing acceptance commands:

```sh
npm ci
npm test
npm run lint
npm run build
```

The Dockerfile pins its Node 24 build base and Nginx runtime base, runs those same
acceptance commands, and records the full source commit in the OCI revision label.
For a local validation build from a clean committed checkout:

```sh
docker --context rancher-desktop buildx build --builder rancher-desktop \
  --platform linux/amd64 --build-arg SOURCE_COMMIT="$(git rev-parse HEAD)" \
  --load -t finance-frontend:validation .
```

Releases use `pharness-finance-frontend-build` in `lucas_engineering`, publishing
`registry.lucas.engineering/finance-frontend:git-<source-sha>`. Deployment uses the
returned immutable digest. The old source-push production restart webhook is
retired. Production GitOps promotion requires its separate human approval.

Service URLs are still compiled through the existing Vite configuration. Loading
`/runtime-config.json` before application initialization remains the separate M11
maintenance WorkItem; this packaging prerequisite does not implement or count as
that autonomous acceptance change.

## Shared Utilities

### `tickerSearch`

The `src/utils/tickerSearch.js` module exports a pure `matchTicker(stock, query)` helper that normalizes search input and safely matches it against a stock's ticker symbol or name.

**Import path:**
```js
import { matchTicker } from './utils/tickerSearch';
```

**Function signature:**
```js
matchTicker(stock, query) -> boolean
```

**Behavior:**
- Trims whitespace from `query` and lowercases both `query` and the stock fields.
- Safely handles missing or `null` `ticker` / `name` fields (treats them as empty strings).
- Returns `true` only when the normalized query is a non-empty substring of the normalized ticker or name.
- Returns `false` for empty/whitespace-only queries, `null`/`undefined` stock objects, or non-string queries.

**Example:**
```js
matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'aapl'); // true
matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, '  apple  '); // true
matchTicker({ ticker: 'AAPL', name: 'Apple Inc.' }, 'GOOG'); // false
```

## Market Overview

The `MarketOverview` component (`src/components/MarketOverview.jsx`) displays US market data fetched from the yfinance backend via `src/services/api.js`.

### Backend Contract

The pinned yfinance_wrapper contract at commit `12ff05dab47778dd2344970001c4218c1825db96` exposes:

```
GET /markets/US
```

Response envelope (exact shape):

```json
{
  "market": "US",
  "summary": { ... },
  "status": { ... } | null
}
```

- `market` — string, always `"US"` for this endpoint
- `summary` — object with nested market summary data
- `status` — object with market status data, or `null` when unavailable

No `indices`, `lastUpdated`, `marketStatus`, or other fields are part of this contract.

### Environment Variable

The yfinance API base is configured at build time via:

```
VITE_YFINANCE_API=https://yfinance.lucas.engineering
```

The service layer uses this boundary directly; no `VITE_API_BASE_URL` or `/api` prefix is introduced.

### Integration

`src/pages/Dashboard.jsx` renders `<MarketOverview />` above the ticker table. The component manages its own loading, empty, and error states.

### Adapter

`src/adapters/marketAdapter.js` provides a pure adapter that:
- Validates the envelope contains exactly `{ market, summary, status }`
- Accepts `null` for `status`
- Rejects non-object envelopes, missing fields, or wrong types
- Formats nested objects as readable key/value output (never `String(object)`)

## Validation

Install the locked dependencies and run the repository validation commands:

```bash
npm ci
npm test
npm run lint
npm run build
```

The tests use Node's built-in test runner. Contract tests in `tests/contract.test.js` prove the exact URL and base usage. Adapter tests in `tests/adapter.test.js` cover validation and formatting edge cases. Lint checks the source tree, and the build command creates the production Vite bundle.
