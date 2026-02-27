import './TimeFrameSelector.css';

const TIME_FRAMES = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'All', days: null },
];

function TimeFrameSelector({ selected, onSelect }) {
    return (
        <div className="timeframe-selector">
            {TIME_FRAMES.map(tf => (
                <button
                    key={tf.label}
                    className={`timeframe-btn ${selected === tf.label ? 'active' : ''}`}
                    onClick={() => onSelect(tf.label, tf.days)}
                >
                    {tf.label}
                </button>
            ))}
        </div>
    );
}

export default TimeFrameSelector;
