import { useState } from 'react';
import { Link } from 'react-router-dom';
import './TickerTable.css';

function TickerTable({ tickers, allTickers = [], onDelete, loading, pagination, onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('');

    const isSearching = searchTerm.length > 0;

    // When searching, filter against ALL tickers; otherwise show current page
    const displayTickers = isSearching
        ? allTickers.filter(ticker =>
            ticker.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticker.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : tickers;

    return (
        <div className="ticker-table-container">
            <div className="table-header">
                <h3 className="table-title">Ticker List</h3>
                <div className="table-search">
                    <input
                        type="text"
                        placeholder="Search all tickers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="table-wrapper">
                {loading && !isSearching ? (
                    <div className="table-loading">
                        <div className="loading-spinner large"></div>
                        <p>Loading tickers...</p>
                    </div>
                ) : (
                    <table className="ticker-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Name</th>
                                <th>Exchange</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayTickers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="no-results">
                                        No tickers found{isSearching ? ` for "${searchTerm}"` : ''}.
                                    </td>
                                </tr>
                            ) : (
                                displayTickers.slice(0, isSearching ? 50 : displayTickers.length).map(ticker => (
                                    <tr key={ticker.id} className="ticker-row-clickable">
                                        <td className="ticker-symbol">
                                            <Link to={`/ticker/${ticker.ticker}`} className="ticker-link">
                                                {ticker.ticker}
                                            </Link>
                                        </td>
                                        <td className="ticker-name">
                                            <Link to={`/ticker/${ticker.ticker}`} className="ticker-link">
                                                {ticker.name}
                                            </Link>
                                        </td>
                                        <td className="ticker-exchange">{ticker.exchange}</td>
                                        <td className="ticker-actions">
                                            <button
                                                className="btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(ticker.id);
                                                }}
                                                title="Delete ticker"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isSearching && displayTickers.length > 0 && (
                <div className="table-pagination">
                    <span className="pagination-info">
                        {displayTickers.length > 50
                            ? `Showing 50 of ${displayTickers.length} results`
                            : `${displayTickers.length} result${displayTickers.length !== 1 ? 's' : ''}`
                        }
                    </span>
                </div>
            )}

            {!isSearching && pagination && (
                <div className="table-pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.offset === 0}
                        onClick={() => onPageChange(Math.max(0, pagination.offset - pagination.limit))}
                    >
                        ← Previous
                    </button>
                    <span className="pagination-info">
                        Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={pagination.offset + pagination.limit >= pagination.total}
                        onClick={() => onPageChange(pagination.offset + pagination.limit)}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

export default TickerTable;
