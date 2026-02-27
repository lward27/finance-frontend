import { useState } from 'react';
import './TickerTable.css';

function TickerTable({ tickers, onDelete, loading, pagination, onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTickers = tickers.filter(ticker =>
        ticker.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticker.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="ticker-table-container">
            <div className="table-header">
                <h3 className="table-title">📊 Ticker List</h3>
                <div className="table-search">
                    <input
                        type="text"
                        placeholder="Search tickers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
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
                            {filteredTickers.map(ticker => (
                                <tr key={ticker.id}>
                                    <td className="ticker-symbol">{ticker.ticker}</td>
                                    <td className="ticker-name">{ticker.name}</td>
                                    <td className="ticker-exchange">{ticker.exchange}</td>
                                    <td className="ticker-actions">
                                        <button
                                            className="btn-delete"
                                            onClick={() => onDelete(ticker.id)}
                                            title="Delete ticker"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {pagination && (
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
