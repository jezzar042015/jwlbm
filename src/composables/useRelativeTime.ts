const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;

function formatValue(value: number, unit: string) {
    return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

export function useRelativeTime() {
    const formatRelativeTime = (value: string | Date | null | undefined) => {
        if (!value) return 'Unknown';

        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return 'Unknown';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        if (diffMs < 0) return 'Just now';

        const minutes = Math.floor(diffMs / MS_PER_MINUTE);
        if (minutes < 60) {
            return minutes < 1 ? 'Just now' : formatValue(minutes, 'minute');
        }

        const hours = Math.floor(diffMs / MS_PER_HOUR);
        if (hours < 24) {
            return formatValue(hours, 'hour');
        }

        const days = Math.floor(diffMs / MS_PER_DAY);
        if (days < 7) {
            return formatValue(days, 'day');
        }

        const weeks = Math.floor(diffMs / MS_PER_WEEK);
        if (weeks < 4) {
            return formatValue(weeks, 'week');
        }

        const months = Math.floor(diffMs / MS_PER_MONTH);
        if (months < 12) {
            return formatValue(months, 'month');
        }

        const years = Math.floor(months / 12);
        return formatValue(years, 'year');
    };

    return {
        formatRelativeTime,
    };
}
