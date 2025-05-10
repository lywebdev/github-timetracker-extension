import { useMemo } from 'preact/hooks';
import { TrackedList } from './TrackedList.jsx';
import { TimeService } from '../../../utils/time.js';
import { STORAGE_KEYS } from '../../../utils/constants.js';
import { useStorageListener } from '../../../hooks/useStorageListener.js';

export function HistoryView() {
    const tracked = useStorageListener(STORAGE_KEYS.TRACKED_TIMES, []);

    const entries = useMemo(() => {
        return tracked.slice(-10).reverse().map((e) => ({
            ...e,
            displayTime: TimeService.formatTime(e.seconds),
        }));
    }, [tracked]);

    return <TrackedList entries={entries} />;
}