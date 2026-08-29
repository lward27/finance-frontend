/**
 * Pure adapter for the yfinance /markets/US envelope.
 *
 * Expected envelope shape:
 *   { market: string, summary: object, status: object | null }
 *
 * No indices, lastUpdated, marketStatus, or other invented fields.
 */

export function adaptMarketEnvelope(raw) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        return { valid: false, error: 'Envelope must be a plain object', data: null };
    }

    if (!('market' in raw)) {
        return { valid: false, error: 'Missing required field: market', data: null };
    }
    if (typeof raw.market !== 'string') {
        return { valid: false, error: 'Invalid type for field: market (expected string)', data: null };
    }

    if (!('summary' in raw)) {
        return { valid: false, error: 'Missing required field: summary', data: null };
    }
    if (typeof raw.summary !== 'object' || raw.summary === null || Array.isArray(raw.summary)) {
        return { valid: false, error: 'Invalid type for field: summary (expected object)', data: null };
    }

    if (!('status' in raw)) {
        return { valid: false, error: 'Missing required field: status', data: null };
    }
    if (raw.status !== null && (typeof raw.status !== 'object' || Array.isArray(raw.status))) {
        return { valid: false, error: 'Invalid type for field: status (expected object or null)', data: null };
    }

    return { valid: true, error: null, data: raw };
}

/**
 * Format nested market/summary/status data as readable key/value text.
 * Never uses String(object) to avoid [object Object].
 */
export function formatMarketData(data) {
    if (!data || typeof data !== 'object') {
        return 'No market data available';
    }

    const lines = [];
    lines.push(`Market: ${data.market ?? 'N/A'}`);
    lines.push(`Summary: ${formatObject(data.summary)}`);
    lines.push(`Status: ${formatObject(data.status)}`);
    return lines.join('\n');
}

function formatObject(obj) {
    if (obj === null || obj === undefined) {
        return 'null';
    }
    if (typeof obj !== 'object') {
        return String(obj);
    }
    if (Array.isArray(obj)) {
        return JSON.stringify(obj);
    }
    const entries = Object.entries(obj);
    if (entries.length === 0) {
        return '(empty)';
    }
    return entries.map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ');
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return JSON.stringify(value);
        }
        const entries = Object.entries(value);
        if (entries.length === 0) {
            return '(empty)';
        }
        return `{${entries.map(([k, v]) => `"${k}":${formatValue(v)}`).join(',')}}`;
    }
    if (typeof value === 'string') {
        return `"${value}"`;
    }
    return String(value);
}
