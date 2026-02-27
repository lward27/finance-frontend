import { useState, useEffect } from 'react';
import PriceChart from '../components/PriceChart';
import HistoryTable from '../components/HistoryTable';
import { databaseApi, yfinanceApi } from '../services/api';
import './Explorer.css';

function Explorer() {
    const [tickers, setTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [tickerInfo, setTickerInfo] = useState(null);
    const [loading, setLoading] = useState({
        tickers: true,
        history: false,
        info: false,
    });
    const [dateRange, setDateRange] = useState({
        from: '',
        to: '',
    });

    // Fetch tickers for autocomplete
    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const data = await databaseApi.getTickers(0, 100);
                setTickers(data);
            } catch (error) {
                console.error('Failed to fetch tickers:', error);
            } finally {
                setLoading(prev => ({ ...prev, tickers: false }));
            }
        };
        fetchTickers();
    }, []);

    // Filtered tickers for autocomplete
    const filteredTickers = tickers.filter(ticker =>
        ticker.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticker.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);

    // Handle ticker selection
    const handleSelectTicker = (ticker) => {
        setSelectedTicker(ticker.ticker);
        setSearchQuery(ticker.ticker);
        setHistoryData([]);
        setTickerInfo(null);
    };

    // Fetch history data
    const handleFetchHistory = async () => {
        if (!selectedTicker) return;

        setLoading(prev => ({ ...prev, history: true, info: true }));

        try {
            // Fetch history from database
            const fromDate = dateRange.from ? new Date(dateRange.from).toISOString() : null;
            const history = await databaseApi.getHistory(selectedTicker, fromDate);
            setHistoryData(history);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(prev => ({ ...prev, history: false }));
        }

        try {
            // Fetch live info from yfinance
            const info = await yfinanceApi.getInfo(selectedTicker);
            setTickerInfo(info);
        } catch (error) {
            console.error('Failed to fetch ticker info:', error);
        } finally {
            setLoading(prev => ({ ...prev, info: false }));
        }
    };

    // Export data as CSV
    const handleExportCSV = () => {
        if (historyData.length === 0) return;

        const headers = ['Date', 'Price Type', 'Price', 'Ticker'];
        const rows = historyData.map(item => [
            item.datetime,
            item.price_type,
            item.price,
            item.ticker_name,
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTicker}_history.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="explorer">
            <div className="explorer-header">
                <h1 className="explorer-title">Data Explorer</h1>
                <p className="explorer-subtitle">Query and visualize historical stock data</p>
            </div>

            <div className="search-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Search for a ticker (e.g., AAPL, MSFT)..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedTicker('');
                            }}
                            className="ticker-search-input"
                        />
                        {searchQuery && !selectedTicker && filteredTickers.length > 0 && (
                            <div className="autocomplete-dropdown">
                                {filteredTickers.map(ticker => (
                                    <div
                                        key={ticker.id}
                                        className="autocomplete-item"
                                        onClick={() => handleSelectTicker(ticker)}
                                    >
                                        <span className="ticker-symbol">{ticker.ticker}</span>
                                        <span className="ticker-name">{ticker.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="date-filters">
                        <div className="date-input-group">
                            <label>From</label>
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                className="date-input"
                            />
                        </div>
                        <div className="date-input-group">
                            <label>To</label>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="date-input"
                            />
                        </div>
                    </div>

                    <button
                        className="btn-search"
                        onClick={handleFetchHistory}
                        disabled={!selectedTicker}
                    >
                        🔍 Search
                    </button>
                </div>
            </div>

            {selectedTicker && (
                <div className="ticker-info-bar">
                    <div className="ticker-badge">
                        <span className="badge-symbol">{selectedTicker}</span>
                        {tickerInfo && (
                            <span className="badge-name">{tickerInfo.shortName || tickerInfo.longName}</span>
                        )}
                    </div>
                    {tickerInfo && (
                        <div className="ticker-quick-stats">
                            {tickerInfo.currentPrice && (
                                <span className="quick-stat">
                                    Price: <strong>${tickerInfo.currentPrice?.toFixed(2)}</strong>
                                </span>
                            )}
                            {tickerInfo.marketCap && (
                                <span className="quick-stat">
                                    Market Cap: <strong>${(tickerInfo.marketCap / 1e9).toFixed(2)}B</strong>
                                </span>
                            )}
                            {tickerInfo.sector && (
                                <span className="quick-stat">
                                    Sector: <strong>{tickerInfo.sector}</strong>
                                </span>
                            )}
                        </div>
                    )}
                    <button className="btn-export" onClick={handleExportCSV} disabled={historyData.length === 0}>
                        📥 Export CSV
                    </button>
                </div>
            )}

            <div className="explorer-content">
                <PriceChart
                    data={historyData}
                    ticker={selectedTicker}
                    loading={loading.history}
                />
                <HistoryTable
                    data={historyData}
                    loading={loading.history}
                />
            </div>
        </div>
    );
}

export default Explorer;
