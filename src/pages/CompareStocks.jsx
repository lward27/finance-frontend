import { useEffect, useMemo, useState } from 'react';
import MultiTickerPriceChart from '../components/MultiTickerPriceChart';
import TimeFrameSelector from '../components/TimeFrameSelector';
import { databaseApi, yfinanceApi } from '../services/api';
import { getTimeFrameDays } from '../utils/timeFrames';
import './CompareStocks.css';

function formatCurrency(value) {
    if (value == null) return '-';
    return `$${value.toFixed(2)}`;
}

function formatPercent(value) {
    if (value == null) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function computeFromDate(days) {
    if (!days) return null;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

function CompareStocks() {
    const [tickers, setTickers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTickers, setSelectedTickers] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [timeFrame, setTimeFrame] = useState('1Y');
    const [loadingTickers, setLoadingTickers] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const [hasCompared, setHasCompared] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const data = await databaseApi.getAllTickers();
                setTickers(data);
            } catch (fetchError) {
                console.error('Failed to fetch tickers:', fetchError);
                setError('Failed to load available tickers.');
            } finally {
                setLoadingTickers(false);
            }
        };

        fetchTickers();
    }, []);

    const filteredTickers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];

        const selected = new Set(selectedTickers.map((ticker) => ticker.ticker));

        return tickers
            .filter((ticker) => !selected.has(ticker.ticker))
            .filter((ticker) =>
                ticker.ticker.toLowerCase().includes(query) ||
                ticker.name.toLowerCase().includes(query)
            )
            .slice(0, 10);
    }, [searchQuery, selectedTickers, tickers]);

    const summaryCards = useMemo(() => comparisonData.map((item) => {
        const firstClose = item.points[0]?.close ?? null;
        const lastClose = item.points[item.points.length - 1]?.close ?? null;
        const returnPct = firstClose && lastClose
            ? ((lastClose - firstClose) / firstClose) * 100
            : null;

        return {
            symbol: item.symbol,
            name: item.name,
            currentPrice: lastClose,
            returnPct,
            dataPoints: item.points.length,
            latestDate: item.points[item.points.length - 1]?.ts ?? null,
        };
    }), [comparisonData]);

    const addTicker = (ticker) => {
        if (selectedTickers.some((selected) => selected.ticker === ticker.ticker)) {
            return;
        }

        setSelectedTickers((current) => [...current, ticker]);
        setSearchQuery('');
        setHasCompared(false);
        setError(null);
    };

    const removeTicker = (symbol) => {
        setSelectedTickers((current) => current.filter((ticker) => ticker.ticker !== symbol));
        setHasCompared(false);
    };

    const runComparison = async (nextTimeFrame = timeFrame) => {
        if (selectedTickers.length < 2) {
            setError('Select at least two tickers to compare.');
            return;
        }

        setLoadingComparison(true);
        setError(null);

        try {
            const fromDate = computeFromDate(getTimeFrameDays(nextTimeFrame));

            const results = await Promise.all(
                selectedTickers.map(async (ticker) => {
                    const [history, info] = await Promise.all([
                        databaseApi.getHistory(ticker.ticker, fromDate),
                        yfinanceApi.getInfo(ticker.ticker).catch(() => null),
                    ]);

                    const points = history
                        .filter((item) => item.close != null)
                        .sort((left, right) => new Date(left.ts) - new Date(right.ts));

                    return {
                        symbol: ticker.ticker,
                        name: info?.shortName || info?.longName || ticker.name,
                        points,
                    };
                })
            );

            const populatedResults = results.filter((result) => result.points.length > 0);

            if (populatedResults.length < 2) {
                setComparisonData([]);
                setError('At least two selected tickers need price history in the chosen time frame.');
            } else {
                setComparisonData(populatedResults);
            }

            setHasCompared(true);
        } catch (compareError) {
            console.error('Failed to compare tickers:', compareError);
            setComparisonData([]);
            setHasCompared(true);
            setError('Failed to load comparison data.');
        } finally {
            setLoadingComparison(false);
        }
    };

    const handleTimeFrameChange = async (label) => {
        setTimeFrame(label);
        if (hasCompared) {
            await runComparison(label);
        }
    };

    return (
        <div className="compare-stocks">
            <div className="compare-header">
                <div>
                    <h1 className="compare-title">Stock Comparison Lab</h1>
                    <p className="compare-subtitle">
                        Build a comparison set, then overlay multiple stocks on the same charts.
                    </p>
                </div>
                <div className="compare-steps">
                    <span className="compare-step active">1. Pick tickers</span>
                    <span className={`compare-step ${selectedTickers.length >= 2 ? 'active' : ''}`}>2. Compare</span>
                    <span className={`compare-step ${hasCompared ? 'active' : ''}`}>3. Explore results</span>
                </div>
            </div>

            <section className="compare-builder">
                <div className="builder-card">
                    <span className="builder-kicker">Workflow</span>
                    <h2>Select two or more stocks</h2>
                    <p>
                        Search by ticker or company name, add symbols to your comparison set, and run the analysis.
                    </p>

                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Add a ticker to compare (e.g., AAPL, MSFT, NVDA)"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="ticker-search-input"
                        />
                        {searchQuery && filteredTickers.length > 0 && (
                            <div className="autocomplete-dropdown">
                                {filteredTickers.map((ticker) => (
                                    <div
                                        key={ticker.id}
                                        className="autocomplete-item"
                                        onClick={() => addTicker(ticker)}
                                    >
                                        <span className="ticker-symbol">{ticker.ticker}</span>
                                        <span className="ticker-name">{ticker.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="selected-tickers">
                        {selectedTickers.length === 0 && (
                            <p className="selected-empty">No stocks added yet.</p>
                        )}
                        {selectedTickers.map((ticker) => (
                            <button
                                key={ticker.ticker}
                                type="button"
                                className="ticker-pill"
                                onClick={() => removeTicker(ticker.ticker)}
                            >
                                <span>{ticker.ticker}</span>
                                <span className="pill-remove">Remove</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="builder-card builder-actions">
                    <span className="builder-kicker">Controls</span>
                    <h2>Choose a window and run it</h2>
                    <p>The comparison view refreshes against the selected time horizon.</p>

                    <TimeFrameSelector selected={timeFrame} onSelect={handleTimeFrameChange} />

                    <button
                        type="button"
                        className="btn-compare"
                        onClick={() => runComparison()}
                        disabled={selectedTickers.length < 2 || loadingComparison}
                    >
                        {loadingComparison ? 'Loading comparison...' : `Compare ${selectedTickers.length || 0} stocks`}
                    </button>

                    <p className="builder-hint">
                        Tip: remove a pill to swap a ticker out without resetting the rest of the workflow.
                    </p>
                </div>
            </section>

            {loadingTickers && (
                <div className="compare-loading">
                    <div className="loading-spinner large"></div>
                    <p>Loading available tickers...</p>
                </div>
            )}

            {error && <div className="compare-error">{error}</div>}

            {hasCompared && !loadingComparison && comparisonData.length > 0 && (
                <>
                    <section className="comparison-summary">
                        {summaryCards.map((card) => (
                            <article key={card.symbol} className="summary-card">
                                <div className="summary-card-top">
                                    <div>
                                        <h3>{card.symbol}</h3>
                                        <p>{card.name}</p>
                                    </div>
                                    <span
                                        className={`summary-badge ${card.returnPct == null ? 'neutral' : card.returnPct >= 0 ? 'positive' : 'negative'}`}
                                    >
                                        {formatPercent(card.returnPct)}
                                    </span>
                                </div>
                                <div className="summary-metrics">
                                    <div>
                                        <span>Latest price</span>
                                        <strong>{formatCurrency(card.currentPrice)}</strong>
                                    </div>
                                    <div>
                                        <span>Data points</span>
                                        <strong>{card.dataPoints}</strong>
                                    </div>
                                    <div>
                                        <span>Latest date</span>
                                        <strong>{card.latestDate || '-'}</strong>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="comparison-charts">
                        <MultiTickerPriceChart series={comparisonData} loading={loadingComparison} />
                        <MultiTickerPriceChart
                            series={comparisonData}
                            loading={loadingComparison}
                            mode="performance"
                        />
                    </section>
                </>
            )}
        </div>
    );
}

export default CompareStocks;
