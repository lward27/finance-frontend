import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PriceChart from '../components/PriceChart';
import VolumeChart from '../components/VolumeChart';
import HistoryTable from '../components/HistoryTable';
import TimeFrameSelector from '../components/TimeFrameSelector';
import { databaseApi, yfinanceApi } from '../services/api';
import './TickerDetail.css';

function TickerDetail() {
    const { symbol } = useParams();
    const [historyData, setHistoryData] = useState([]);
    const [tickerInfo, setTickerInfo] = useState(null);
    const [loading, setLoading] = useState({ history: true, info: true });
    const [timeFrame, setTimeFrame] = useState('1Y');
    const [error, setError] = useState(null);

    const computeFromDate = useCallback((days) => {
        if (!days) return null;
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString();
    }, []);

    const fetchData = useCallback(async (days) => {
        setLoading({ history: true, info: true });
        setError(null);

        try {
            const fromDate = computeFromDate(days);
            const history = await databaseApi.getHistory(symbol, fromDate);
            setHistoryData(history);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setError('Failed to load price history.');
        } finally {
            setLoading(prev => ({ ...prev, history: false }));
        }

        try {
            const info = await yfinanceApi.getInfo(symbol);
            setTickerInfo(info);
        } catch (err) {
            console.error('Failed to fetch ticker info:', err);
        } finally {
            setLoading(prev => ({ ...prev, info: false }));
        }
    }, [symbol, computeFromDate]);

    useEffect(() => {
        fetchData(365);
    }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTimeFrameChange = (label, days) => {
        setTimeFrame(label);
        fetchData(days);
    };

    const formatMarketCap = (cap) => {
        if (!cap) return '-';
        if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
        return `$${cap.toLocaleString()}`;
    };

    return (
        <div className="ticker-detail">
            <div className="detail-header">
                <div className="detail-header-left">
                    <Link to="/" className="back-link">← Back</Link>
                    <div className="detail-title-group">
                        <h1 className="detail-symbol">{symbol}</h1>
                        {tickerInfo && (
                            <span className="detail-name">
                                {tickerInfo.shortName || tickerInfo.longName}
                            </span>
                        )}
                    </div>
                </div>
                {tickerInfo && (
                    <div className="detail-stats">
                        {tickerInfo.currentPrice != null && (
                            <div className="detail-stat">
                                <span className="stat-label">Price</span>
                                <span className="stat-value">${tickerInfo.currentPrice.toFixed(2)}</span>
                            </div>
                        )}
                        {tickerInfo.marketCap != null && (
                            <div className="detail-stat">
                                <span className="stat-label">Market Cap</span>
                                <span className="stat-value">{formatMarketCap(tickerInfo.marketCap)}</span>
                            </div>
                        )}
                        {tickerInfo.sector && (
                            <div className="detail-stat">
                                <span className="stat-label">Sector</span>
                                <span className="stat-value">{tickerInfo.sector}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="detail-controls">
                <TimeFrameSelector selected={timeFrame} onSelect={handleTimeFrameChange} />
            </div>

            {error && <div className="detail-error">{error}</div>}

            <div className="detail-charts">
                <PriceChart data={historyData} ticker={symbol} loading={loading.history} />
                <VolumeChart data={historyData} ticker={symbol} loading={loading.history} />
            </div>

            <HistoryTable data={historyData} loading={loading.history} />
        </div>
    );
}

export default TickerDetail;
