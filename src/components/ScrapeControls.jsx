import { useState, useEffect } from 'react';
import './ScrapeControls.css';

function ScrapeControls({ status, onStart, onStop, onRefresh }) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let interval;
        if (status?.is_running) {
            interval = setInterval(() => {
                onRefresh();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [status?.is_running, onRefresh]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    return (
        <div className="scrape-controls">
            <div className="scrape-header">
                <h3 className="scrape-title">🔄 Scraper Status</h3>
                <button
                    className="btn-refresh"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? '⏳' : '🔄'}
                </button>
            </div>

            <div className="scrape-status">
                <div className={`status-indicator ${status?.is_running ? 'running' : 'idle'}`}>
                    <span className="status-dot"></span>
                    <span className="status-text">
                        {status?.is_running ? 'Running' : 'Idle'}
                    </span>
                </div>

                {status?.is_running && (
                    <>
                        <div className="progress-section">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${status.progress_percent || 0}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">
                                {status.processed_tickers} / {status.total_tickers} tickers ({status.progress_percent?.toFixed(1)}%)
                            </span>
                        </div>

                        {status.current_ticker && (
                            <div className="current-ticker">
                                <span className="label">Currently processing:</span>
                                <span className="ticker-name">{status.current_ticker}</span>
                            </div>
                        )}
                    </>
                )}

                {status?.started_at && (
                    <div className="scrape-timing">
                        <span className="label">Started:</span>
                        <span className="value">{status.started_at}</span>
                    </div>
                )}

                {status?.completed_at && !status?.is_running && (
                    <div className="scrape-timing">
                        <span className="label">Completed:</span>
                        <span className="value">{status.completed_at}</span>
                    </div>
                )}

                {status?.last_error && (
                    <div className="scrape-error">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{status.last_error}</span>
                    </div>
                )}
            </div>

            <div className="scrape-actions">
                {!status?.is_running ? (
                    <button className="btn-primary btn-start" onClick={onStart}>
                        <span className="btn-icon">▶️</span>
                        Start Scrape
                    </button>
                ) : (
                    <button className="btn-danger btn-stop" onClick={onStop}>
                        <span className="btn-icon">⏹️</span>
                        Stop Scrape
                    </button>
                )}
            </div>
        </div>
    );
}

export default ScrapeControls;
