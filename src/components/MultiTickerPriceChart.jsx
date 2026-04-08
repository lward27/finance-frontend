import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './MultiTickerPriceChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SERIES_COLORS = [
    { border: '#6366f1', background: 'rgba(99, 102, 241, 0.14)' },
    { border: '#22c55e', background: 'rgba(34, 197, 94, 0.14)' },
    { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.14)' },
    { border: '#ec4899', background: 'rgba(236, 72, 153, 0.14)' },
    { border: '#06b6d4', background: 'rgba(6, 182, 212, 0.14)' },
    { border: '#a855f7', background: 'rgba(168, 85, 247, 0.14)' },
];

function formatPercent(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

function MultiTickerPriceChart({ series, loading, mode = 'price' }) {
    const title = mode === 'performance' ? 'Relative Performance' : 'Price Comparison';

    if (loading) {
        return (
            <div className="multi-price-chart-container">
                <div className="chart-loading">
                    <div className="loading-spinner large"></div>
                    <p>Loading comparison data...</p>
                </div>
            </div>
        );
    }

    if (!series || series.length === 0) {
        return (
            <div className="multi-price-chart-container">
                <div className="chart-empty">
                    <span className="empty-icon">📈</span>
                    <p>Select at least two tickers to compare.</p>
                </div>
            </div>
        );
    }

    const allDates = [...new Set(
        series.flatMap((item) => item.points.map((point) => point.ts))
    )].sort((left, right) => new Date(left) - new Date(right));

    if (allDates.length === 0) {
        return (
            <div className="multi-price-chart-container">
                <div className="chart-empty">
                    <span className="empty-icon">📈</span>
                    <p>No comparable price history is available for the selected tickers.</p>
                </div>
            </div>
        );
    }

    const labels = allDates.map((date) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    );

    const datasets = series.map((item, index) => {
        const colors = SERIES_COLORS[index % SERIES_COLORS.length];
        const pointMap = new Map(item.points.map((point) => [point.ts, point.close]));
        const basePrice = item.points[0]?.close ?? null;

        return {
            label: mode === 'performance' ? `${item.symbol} Return` : `${item.symbol} Close`,
            data: allDates.map((date) => {
                const close = pointMap.get(date);
                if (close == null) return null;
                if (mode === 'performance') {
                    return basePrice ? ((close - basePrice) / basePrice) * 100 : null;
                }
                return close;
            }),
            borderColor: colors.border,
            backgroundColor: colors.background,
            fill: false,
            tension: 0.35,
            spanGaps: true,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: '#0f172a',
        };
    });

    const dataPointCount = datasets.reduce(
        (count, dataset) => count + dataset.data.filter((value) => value != null).length,
        0
    );

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(99, 102, 241, 0.25)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label(context) {
                        const value = context.parsed.y;
                        if (value == null) return `${context.dataset.label}: no data`;
                        const formatted = mode === 'performance'
                            ? formatPercent(value)
                            : formatCurrency(value);
                        return `${context.dataset.label}: ${formatted}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(99, 102, 241, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    maxTicksLimit: 10,
                },
            },
            y: {
                grid: {
                    color: 'rgba(99, 102, 241, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    callback(value) {
                        return mode === 'performance'
                            ? formatPercent(Number(value))
                            : formatCurrency(Number(value));
                    },
                },
            },
        },
    };

    return (
        <div className="multi-price-chart-container">
            <div className="chart-header">
                <h3 className="chart-title">{mode === 'performance' ? '📊 ' : '📈 '}{title}</h3>
                <div className="chart-stats">
                    <span className="stat">
                        Tickers: <strong>{series.length}</strong>
                    </span>
                    <span className="stat">
                        Dates: <strong>{allDates.length}</strong>
                    </span>
                    <span className="stat">
                        Points: <strong>{dataPointCount}</strong>
                    </span>
                </div>
            </div>
            <div className="chart-wrapper">
                <Line data={{ labels, datasets }} options={options} />
            </div>
        </div>
    );
}

export default MultiTickerPriceChart;
