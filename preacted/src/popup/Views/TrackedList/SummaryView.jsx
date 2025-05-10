import { useMemo } from 'preact/hooks';
import { TimeService } from '../../../utils/time.js';
import { TrackedList } from './TrackedList.jsx';
import { STORAGE_KEYS } from '../../../utils/constants.js';
import { useStorageListener } from '../../../hooks/useStorageListener.js';

export function SummaryView() {
    const tracked = useStorageListener(STORAGE_KEYS.TRACKED_TIMES, []);

    const entries = useMemo(() => {
        const grouped = tracked.reduce((acc, entry) => {
            if (!acc[entry.issueUrl]) {
                acc[entry.issueUrl] = { title: entry.title, seconds: 0, issueUrl: entry.issueUrl };
            }
            acc[entry.issueUrl].seconds += entry.seconds;
            return acc;
        }, {});

        return Object.values(grouped).map((e) => ({
            ...e,
            displayTime: TimeService.formatTime(e.seconds),
        }));
    }, [tracked]);

    return <TrackedList entries={entries} />;
}