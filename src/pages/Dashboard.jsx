import { useState, useEffect, useCallback } from 'react';
import StatsCard from '../components/StatsCard';
import TickerTable from '../components/TickerTable';
import ScrapeControls from '../components/ScrapeControls';
import { databaseApi, scraperApi } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const [tickerCount, setTickerCount] = useState(0);
    const [tickers, setTickers] = useState([]);
    const [scrapeStatus, setScrapeStatus] = useState(null);
    const [loading, setLoading] = useState({
        count: true,
        tickers: true,
        scrape: true,
    });
    const [pagination, setPagination] = useState({
        offset: 0,
        limit: 20,
        total: 0,
    });
    const [serviceHealth, setServiceHealth] = useState({
        database: null,
        scraper: null,
    });

    // Fetch ticker count
    const fetchTickerCount = async () => {
        try {
            const count = await databaseApi.getTickerCount();
            setTickerCount(count);
            setPagination(prev => ({ ...prev, total: count }));
        } catch (error) {
            console.error('Failed to fetch ticker count:', error);
        } finally {
            setLoading(prev => ({ ...prev, count: false }));
        }
    };

    // Fetch tickers
    const fetchTickers = async (offset = 0) => {
        setLoading(prev => ({ ...prev, tickers: true }));
        try {
            const data = await databaseApi.getTickers(offset, pagination.limit);
            setTickers(data);
            setPagination(prev => ({ ...prev, offset }));
        } catch (error) {
            console.error('Failed to fetch tickers:', error);
        } finally {
            setLoading(prev => ({ ...prev, tickers: false }));
        }
    };

    // Fetch scrape status
    const fetchScrapeStatus = useCallback(async () => {
        try {
            const status = await scraperApi.getStatus();
            setScrapeStatus(status);
        } catch (error) {
            console.error('Failed to fetch scrape status:', error);
        } finally {
            setLoading(prev => ({ ...prev, scrape: false }));
        }
    }, []);

    // Check service health
    const checkHealth = async () => {
        try {
            await databaseApi.healthCheck();
            setServiceHealth(prev => ({ ...prev, database: 'healthy' }));
        } catch {
            setServiceHealth(prev => ({ ...prev, database: 'unhealthy' }));
        }

        try {
            await scraperApi.healthCheck();
            setServiceHealth(prev => ({ ...prev, scraper: 'healthy' }));
        } catch {
            setServiceHealth(prev => ({ ...prev, scraper: 'unhealthy' }));
        }
    };

    // Start scrape
    const handleStartScrape = async () => {
        try {
            await scraperApi.startScrape();
            fetchScrapeStatus();
        } catch (error) {
            console.error('Failed to start scrape:', error);
        }
    };

    // Stop scrape
    const handleStopScrape = async () => {
        try {
            await scraperApi.stopScrape();
            fetchScrapeStatus();
        } catch (error) {
            console.error('Failed to stop scrape:', error);
        }
    };

    // Delete ticker
    const handleDeleteTicker = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ticker?')) return;
        try {
            await databaseApi.deleteTicker(id);
            fetchTickers(pagination.offset);
            fetchTickerCount();
        } catch (error) {
            console.error('Failed to delete ticker:', error);
        }
    };

    // Handle pagination
    const handlePageChange = (newOffset) => {
        fetchTickers(newOffset);
    };

    useEffect(() => {
        fetchTickerCount();
        fetchTickers(0);
        fetchScrapeStatus();
        checkHealth();
    }, []);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dataset Management</h1>
                <p className="dashboard-subtitle">Monitor and manage your stock data collection</p>
            </div>

            <div className="stats-grid">
                <StatsCard
                    title="Total Tickers"
                    value={tickerCount.toLocaleString()}
                    icon="📊"
                    loading={loading.count}
                />
                <StatsCard
                    title="Database Status"
                    value={serviceHealth.database === 'healthy' ? '✓ Online' : serviceHealth.database === 'unhealthy' ? '✗ Offline' : 'Checking...'}
                    icon="🗄️"
                    loading={serviceHealth.database === null}
                />
                <StatsCard
                    title="Scraper Status"
                    value={serviceHealth.scraper === 'healthy' ? '✓ Online' : serviceHealth.scraper === 'unhealthy' ? '✗ Offline' : 'Checking...'}
                    icon="🔄"
                    loading={serviceHealth.scraper === null}
                />
                <StatsCard
                    title="Scrape Progress"
                    value={scrapeStatus?.is_running ? `${scrapeStatus.progress_percent?.toFixed(1)}%` : 'Idle'}
                    icon="⏱️"
                    loading={loading.scrape}
                    trend={scrapeStatus?.is_running ? { type: 'up', text: 'In progress' } : null}
                />
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    <TickerTable
                        tickers={tickers}
                        onDelete={handleDeleteTicker}
                        loading={loading.tickers}
                        pagination={{ ...pagination, total: tickerCount }}
                        onPageChange={handlePageChange}
                    />
                </div>
                <div className="dashboard-sidebar">
                    <ScrapeControls
                        status={scrapeStatus}
                        onStart={handleStartScrape}
                        onStop={handleStopScrape}
                        onRefresh={fetchScrapeStatus}
                    />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
