// API service for communicating with backend microservices

const DATABASE_API = import.meta.env.VITE_DATABASE_API || 'http://localhost:8001';
const YFINANCE_API = import.meta.env.VITE_YFINANCE_API || 'http://localhost:8002';
const SCRAPER_API = import.meta.env.VITE_SCRAPER_API || 'http://localhost:8003';

// Database Service APIs
export const databaseApi = {
    // Ticker endpoints
    async getTickers(offset = 0, limit = 100) {
        const response = await fetch(`${DATABASE_API}/tickers?offset=${offset}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch tickers');
        return response.json();
    },

    async getTickerCount() {
        const response = await fetch(`${DATABASE_API}/tickers/count`);
        if (!response.ok) throw new Error('Failed to fetch ticker count');
        return response.json();
    },

    // Fetch all tickers by paginating through the API (cached, concurrency-limited)
    _allTickersCache: null,
    async getAllTickers() {
        if (this._allTickersCache) return this._allTickersCache;
        const count = await this.getTickerCount();
        const batchSize = 100;
        const concurrency = 5;
        const allResults = [];
        for (let i = 0; i < count; i += batchSize * concurrency) {
            const chunk = [];
            for (let j = 0; j < concurrency && i + j * batchSize < count; j++) {
                chunk.push(this.getTickers(i + j * batchSize, batchSize));
            }
            const results = await Promise.all(chunk);
            allResults.push(...results);
        }
        this._allTickersCache = allResults.flat();
        return this._allTickersCache;
    },

    invalidateTickerCache() {
        this._allTickersCache = null;
    },

    async deleteTicker(id) {
        const response = await fetch(`${DATABASE_API}/tickers/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete ticker');
        return response.json();
    },

    // History endpoints
    async getHistory(tickerName, fromDatetime = null) {
        let url = `${DATABASE_API}/history?ticker_name=${encodeURIComponent(tickerName)}`;
        if (fromDatetime) {
            url += `&from_datetime=${encodeURIComponent(fromDatetime)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch history');
        return response.json();
    },

    async getLastHistoryDate(tickerName) {
        const response = await fetch(`${DATABASE_API}/history/last_date?ticker_name=${encodeURIComponent(tickerName)}`);
        if (!response.ok) throw new Error('Failed to fetch last date');
        return response.json();
    },

    async healthCheck() {
        const response = await fetch(`${DATABASE_API}/healthz`);
        if (!response.ok) throw new Error('Database service unhealthy');
        return response.json();
    }
};

// YFinance Service APIs
export const yfinanceApi = {
    async getInfo(tickerName) {
        const response = await fetch(`${YFINANCE_API}/info?ticker_name=${encodeURIComponent(tickerName)}`);
        if (!response.ok) throw new Error('Failed to fetch ticker info');
        return response.json();
    },

    async getHistory(tickerName, period) {
        const response = await fetch(`${YFINANCE_API}/history?ticker_name=${encodeURIComponent(tickerName)}&period=${period}`);
        if (!response.ok) throw new Error('Failed to fetch history from YFinance');
        return response.json();
    },

    async healthCheck() {
        const response = await fetch(`${YFINANCE_API}/healthz`);
        if (!response.ok) throw new Error('YFinance service unhealthy');
        return response.json();
    }
};

// Scraper Manager APIs
export const scraperApi = {
    async startScrape() {
        const response = await fetch(`${SCRAPER_API}/scrape/start`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to start scrape');
        return response.json();
    },

    async stopScrape() {
        const response = await fetch(`${SCRAPER_API}/scrape/stop`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to stop scrape');
        return response.json();
    },

    async getStatus() {
        const response = await fetch(`${SCRAPER_API}/scrape/status`);
        if (!response.ok) throw new Error('Failed to get scrape status');
        return response.json();
    },

    async healthCheck() {
        const response = await fetch(`${SCRAPER_API}/healthz`);
        if (!response.ok) throw new Error('Scraper service unhealthy');
        return response.json();
    }
};
