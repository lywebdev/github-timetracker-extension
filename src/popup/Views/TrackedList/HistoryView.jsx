import { useMemo, useState } from 'preact/hooks';
import { TrackedList } from './TrackedList.jsx';
import { TimeService } from '../../../utils/time.js';
import { SearchBar } from '../../../components/SearchBar/SearchBar.jsx';

export function HistoryView({ tracked }) {
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

    const filteredTracked = useMemo(() => {
        return todayTracked.filter(entry =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.issueUrl && entry.issueUrl.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [todayTracked, searchTerm]);

    const entries = useMemo(() => {
        return filteredTracked.slice(-10).reverse().map((e) => ({
            ...e,
            displayTime: TimeService.formatTime(e.seconds),
        }));
    }, [filteredTracked]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
      <>
          <SearchBar onSearch={handleSearch} />
          <TrackedList entries={entries} />
      </>
    );
}