import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRelativeTime } from '../composables/useRelativeTime';

describe('useRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('formats recent timestamps into friendly relative labels', () => {
        const { formatRelativeTime } = useRelativeTime();

        expect(formatRelativeTime(new Date('2024-01-15T11:30:00Z'))).toBe('30 minutes ago');
        expect(formatRelativeTime(new Date('2024-01-14T12:00:00Z'))).toBe('1 day ago');
        expect(formatRelativeTime(new Date('2024-01-08T12:00:00Z'))).toBe('1 week ago');
        expect(formatRelativeTime(new Date('2023-10-15T12:00:00Z'))).toBe('3 months ago');
    });

    it('returns a fallback when the date is invalid', () => {
        const { formatRelativeTime } = useRelativeTime();

        expect(formatRelativeTime('not-a-date')).toBe('Unknown');
    });
});
