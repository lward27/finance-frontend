import './StatsCard.css';

function StatsCard({ title, value, icon, trend, loading }) {
    return (
        <div className="stats-card">
            <div className="stats-card-header">
                <span className="stats-icon">{icon}</span>
                <span className="stats-title">{title}</span>
            </div>
            <div className="stats-value">
                {loading ? (
                    <div className="stats-loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    value
                )}
            </div>
            {trend && (
                <div className={`stats-trend ${trend.type}`}>
                    <span className="trend-icon">{trend.type === 'up' ? '↑' : trend.type === 'down' ? '↓' : '→'}</span>
                    <span className="trend-text">{trend.text}</span>
                </div>
            )}
        </div>
    );
}

export default StatsCard;
