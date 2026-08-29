# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Build docker image with this:

```bash
docker build --platform linux/amd64 --build-arg VITE_DATABASE_API=https://finance-db.lucas.engineering --build-arg VITE_YFINANCE_API=https://yfinance.lucas.engineering -t registry.lucas.engineering/finance_frontend:1.3 .

```

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
