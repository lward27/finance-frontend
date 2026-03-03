import './HistoryTable.css';

function HistoryTable({ data, loading }) {
    if (loading) {
        return (
            <div className="history-table-container">
                <div className="table-loading">
                    <div className="loading-spinner large"></div>
                    <p>Loading history data...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="history-table-container">
                <div className="table-empty">
                    <span className="empty-icon">📋</span>
                    <p>No history data to display.</p>
                </div>
            </div>
        );
    }

    const tableData = [...data].sort((a, b) => new Date(b.ts) - new Date(a.ts));

    const formatPrice = (price) => {
        if (price === undefined || price === null) return '-';
        return typeof price === 'number' ? `$${price.toFixed(2)}` : price;
    };

    const formatVolume = (volume) => {
        if (volume === undefined || volume === null) return '-';
        if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
        if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
        return volume.toFixed(0);
    };

    return (
        <div className="history-table-container">
            <div className="table-header">
                <h3 className="table-title">📋 Price History Data</h3>
                <span className="row-count">{tableData.length} days</span>
            </div>
            <div className="table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close</th>
                            <th>Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.slice(0, 100).map(row => (
                            <tr key={row.ts}>
                                <td className="date-cell">{row.ts}</td>
                                <td className="price-cell">{formatPrice(row.open)}</td>
                                <td className="price-cell high">{formatPrice(row.high)}</td>
                                <td className="price-cell low">{formatPrice(row.low)}</td>
                                <td className="price-cell close">{formatPrice(row.close)}</td>
                                <td className="volume-cell">{formatVolume(row.volume)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tableData.length > 100 && (
                <div className="table-footer">
                    Showing 100 of {tableData.length} rows
                </div>
            )}
        </div>
    );
}

export default HistoryTable;
