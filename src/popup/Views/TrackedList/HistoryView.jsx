// popup/Views/TrackedList/HistoryView.jsx
import { useMemo, useState } from 'preact/hooks';
import { TrackedList } from './TrackedList.jsx';
import { TimeService } from '../../../utils/time.js';
import {SearchBar} from "../../../components/SearchBar/SearchBar.jsx";

export function HistoryView({tracked}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredTracked = useMemo(() => {
        return tracked.filter(entry =>
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.issueUrl && entry.issueUrl.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [tracked, searchTerm]);

    const entries = useMemo(() => {
        return filteredTracked.slice(-10).reverse().map((e) => ({
            ...e,
            displayTime: TimeService.formatTime(e.seconds),
        }));
    }, [filteredTracked]);

    return (
        <>
            <SearchBar onSearch={handleSearch} />
            <TrackedList entries={entries} />
        </>
    );
}