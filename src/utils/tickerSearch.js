/**
 * Pure shared ticker-search helper.
 *
 * Normalizes the query (trim + lowercase) and safely matches it against
 * a stock's ticker symbol or name (both lowercased). Missing or null
 * ticker/name fields are handled gracefully.
 *
 * @param {{ ticker?: string, name?: string }} stock
 * @param {string} query
 * @returns {boolean}
 */
export function matchTicker(stock, query) {
  if (!stock || typeof query !== 'string') {
    return false;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return false;
  }

  const ticker = (stock.ticker ?? '').toLowerCase();
  const name = (stock.name ?? '').toLowerCase();

  return ticker.includes(normalizedQuery) || name.includes(normalizedQuery);
}
