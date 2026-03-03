import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './VolumeChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function VolumeChart({ data, ticker, loading }) {
    if (loading) {
        return (
            <div className="volume-chart-container">
                <div className="chart-loading">
                    <div className="loading-spinner large"></div>
                    <p>Loading volume data...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="volume-chart-container">
                <div className="chart-empty">
                    <span className="empty-icon">📊</span>
                    <p>No volume data to display.</p>
                </div>
            </div>
        );
    }

    const volumeData = data
        .filter(item => item.volume != null)
        .sort((a, b) => new Date(a.ts) - new Date(b.ts));

    if (volumeData.length === 0) {
        return (
            <div className="volume-chart-container">
                <div className="chart-empty">
                    <span className="empty-icon">📊</span>
                    <p>No volume data available for {ticker}.</p>
                </div>
            </div>
        );
    }

    const labels = volumeData.map(item =>
        new Date(item.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    );

    const volumes = volumeData.map(item => item.volume);

    const chartData = {
        labels,
        datasets: [
            {
                label: `${ticker} Volume`,
                data: volumes,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 1,
                borderRadius: 2,
            },
        ],
    };

    const formatVolume = (value) => {
        if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
        return value.toString();
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    font: { size: 12, weight: '500' },
                    usePointStyle: true,
                    pointStyle: 'rect',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f1f5f9',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return formatVolume(context.parsed.y);
                    }
                }
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
                    callback: function (value) {
                        return formatVolume(value);
                    }
                },
            },
        },
    };

    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    return (
        <div className="volume-chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Volume: {ticker}</h3>
                <div className="chart-stats">
                    <span className="stat">
                        Avg: <strong>{formatVolume(avgVolume)}</strong>
                    </span>
                    <span className="stat">
                        Max: <strong>{formatVolume(Math.max(...volumes))}</strong>
                    </span>
                    <span className="stat">
                        Points: <strong>{volumes.length}</strong>
                    </span>
                </div>
            </div>
            <div className="chart-wrapper">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}

export default VolumeChart;
