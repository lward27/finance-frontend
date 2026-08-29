import { useState, useEffect } from 'react';
import { yfinanceApi } from '../services/api';
import { adaptMarketEnvelope, formatMarketData } from '../adapters/marketAdapter';
import './MarketOverview.css';

function MarketOverview() {
    const [state, setState] = useState({
        loading: true,
        error: null,
        data: null,
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setState({ loading: true, error: null, data: null });
            try {
                const raw = await yfinanceApi.getUSMarket();
                if (cancelled) return;
                const adapted = adaptMarketEnvelope(raw);
                if (!adapted.valid) {
                    setState({ loading: false, error: adapted.error, data: null });
                    return;
                }
                setState({ loading: false, error: null, data: adapted.data });
            } catch (err) {
                if (cancelled) return;
                setState({ loading: false, error: err.message || 'Failed to load market data', data: null });
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    if (state.loading) {
        return (
            <div className="market-overview">
                <h3 className="market-overview-title">US Market Overview</h3>
                <div className="market-overview-loading">Loading market data…</div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="market-overview">
                <h3 className="market-overview-title">US Market Overview</h3>
                <div className="market-overview-error">Error: {state.error}</div>
            </div>
        );
    }

    if (!state.data) {
        return (
            <div className="market-overview">
                <h3 className="market-overview-title">US Market Overview</h3>
                <div className="market-overview-empty">No market data available.</div>
            </div>
        );
    }

    return (
        <div className="market-overview">
            <h3 className="market-overview-title">US Market Overview</h3>
            <pre className="market-overview-body">{formatMarketData(state.data)}</pre>
        </div>
    );
}

export default MarketOverview;
