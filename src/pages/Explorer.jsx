import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseApi } from '../services/api';
import './Explorer.css';

function Explorer() {
    const [tickers, setTickers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch all tickers for search
    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const data = await databaseApi.getAllTickers();
                setTickers(data);
            } catch (error) {
                console.error('Failed to fetch tickers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickers();
    }, []);

    // Filtered tickers for autocomplete
    const filteredTickers = tickers.filter(ticker =>
        ticker.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticker.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);

    // Navigate to ticker detail on selection
    const handleSelectTicker = (ticker) => {
        navigate(`/ticker/${ticker.ticker}`);
    };

    return (
        <div className="explorer">
            <div className="explorer-header">
                <h1 className="explorer-title">Data Explorer</h1>
                <p className="explorer-subtitle">Search and explore historical stock data</p>
            </div>

            <div className="search-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Search for a ticker (e.g., AAPL, GOOG, MSFT)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ticker-search-input"
                        />
                        {searchQuery && filteredTickers.length > 0 && (
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
                </div>
            </div>

            {loading && (
                <div className="explorer-loading">
                    <div className="loading-spinner large"></div>
                    <p>Loading tickers...</p>
                </div>
            )}

            {!loading && searchQuery && filteredTickers.length === 0 && (
                <div className="explorer-empty">
                    <p>No tickers found for "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
}

export default Explorer;
