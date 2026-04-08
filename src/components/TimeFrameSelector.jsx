import './TimeFrameSelector.css';
import { TIME_FRAMES } from '../utils/timeFrames';

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
