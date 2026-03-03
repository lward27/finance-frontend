import { useEffect, useRef } from 'react';
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
import './PriceChart.css';

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

function PriceChart({ data, ticker, loading }) {
    if (loading) {
        return (
            <div className="price-chart-container">
                <div className="chart-loading">
                    <div className="loading-spinner large"></div>
                    <p>Loading chart data...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="price-chart-container">
                <div className="chart-empty">
                    <span className="empty-icon">📊</span>
                    <p>No data to display. Select a ticker and query history.</p>
                </div>
            </div>
        );
    }

    // Process data for the chart
    const closeData = data
        .filter(item => item.close != null)
        .sort((a, b) => new Date(a.ts) - new Date(b.ts));

    const labels = closeData.map(item =>
        new Date(item.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    );

    const prices = closeData.map(item => item.close);

    const chartData = {
        labels,
        datasets: [
            {
                label: `${ticker} Close Price`,
                data: prices,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(99, 102, 241)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
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
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f1f5f9',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `$${context.parsed.y.toFixed(2)}`;
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
                        return '$' + value.toFixed(2);
                    }
                },
            },
        },
    };

    return (
        <div className="price-chart-container">
            <div className="chart-header">
                <h3 className="chart-title">📈 Price History: {ticker}</h3>
                <div className="chart-stats">
                    <span className="stat">
                        High: <strong>${Math.max(...prices).toFixed(2)}</strong>
                    </span>
                    <span className="stat">
                        Low: <strong>${Math.min(...prices).toFixed(2)}</strong>
                    </span>
                    <span className="stat">
                        Points: <strong>{prices.length}</strong>
                    </span>
                </div>
            </div>
            <div className="chart-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}

export default PriceChart;
