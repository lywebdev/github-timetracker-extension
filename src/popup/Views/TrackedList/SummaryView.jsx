import { useMemo, useState } from 'preact/hooks';
import { TimeService } from '../../../utils/time.js';
import { TrackedList } from './TrackedList.jsx';
import { SearchBar } from '../../../components/SearchBar/SearchBar.jsx';

export function SummaryView({ tracked }) {
    const getLocalDateString = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [searchTerm, setSearchTerm] = useState('');

    const todayTracked = useMemo(() => {
        const todayStr = getLocalDateString();
        return tracked.filter(entry => entry.date === todayStr);
    }, [tracked]);

    const entries = useMemo(() => {
        const grouped = todayTracked.reduce((acc, entry) => {
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
    }, [todayTracked]);

    const totalTime = useMemo(() => {
        const totalSeconds = entries.reduce((sum, entry) => sum + entry.seconds, 0);
        return TimeService.formatTime(totalSeconds);
    }, [entries]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredEntries = useMemo(() => {
        return entries.filter(
          (entry) =>
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.issueUrl.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm]);

    return (
      <div className="text-gray-900">
          <div className="mb-2 font-bold">Total time: {totalTime}</div>
          <SearchBar onSearch={handleSearch} />
          <TrackedList entries={filteredEntries} showTimerControls={true} />
      </div>
    );
}