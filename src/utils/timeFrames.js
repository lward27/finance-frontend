export const TIME_FRAMES = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'All', days: null },
];

export function getTimeFrameDays(label) {
    return TIME_FRAMES.find((timeFrame) => timeFrame.label === label)?.days ?? 365;
}
