import { useMemo, useState, useEffect } from 'preact/hooks';
import { TimeService } from '../../../utils/time.js';
import { TrackedList } from './TrackedList.jsx';
import { TimerService } from '../../../utils/timer.js';
import { StorageService } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants.js';
import {SearchBar} from "../../../components/SearchBar/SearchBar.jsx";

export function SummaryView({tracked}) {
    const [activeIssue, setActiveIssue] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [currentTimes, setCurrentTimes] = useState({});
    const [searchTerm, setSearchTerm] = useState(''); // Добавляем состояние для поиска

    // Загружаем данные об активной задаче и синхронизируем
    useEffect(() => {
        const loadActiveData = async () => {
            const [active, start] = await Promise.all([
                StorageService.get(STORAGE_KEYS.ACTIVE_ISSUE),
                StorageService.get(STORAGE_KEYS.START_TIME),
            ]);
            setActiveIssue(active);
            setStartTime(start);

            // Немедленное обновление времени для активной задачи
            if (active && start && !isNaN(new Date(start).getTime())) {
                const totalTime = await TimerService.getTotalTimeForIssue(active);
                const elapsed = (Date.now() - new Date(start).getTime()) / 1000;
                setCurrentTimes((prev) => ({
                    ...prev,
                    [active]: TimeService.formatTime(elapsed + totalTime),
                }));
            }
        };
        loadActiveData();

        // Слушаем изменения в storage
        const listener = (changes) => {
            if (changes[STORAGE_KEYS.ACTIVE_ISSUE]) {
                setActiveIssue(changes[STORAGE_KEYS.ACTIVE_ISSUE].newValue);
            }
            if (changes[STORAGE_KEYS.START_TIME]) {
                setStartTime(changes[STORAGE_KEYS.START_TIME].newValue);
            }
        };
        chrome.storage.local.onChanged.addListener(listener);

        return () => {
            chrome.storage.local.onChanged.removeListener(listener);
        };
    }, []);

    // Обновление суммарного времени для активной задачи
    useEffect(() => {
        if (!activeIssue || !startTime || isNaN(new Date(startTime).getTime())) {
            setCurrentTimes((prev) => {
                const newTimes = { ...prev };
                delete newTimes[activeIssue];
                return newTimes;
            });
            return;
        }

        const updateTotalTime = async () => {
            const totalTime = await TimerService.getTotalTimeForIssue(activeIssue);
            const intervalId = setInterval(() => {
                const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
                setCurrentTimes((prev) => ({
                    ...prev,
                    [activeIssue]: TimeService.formatTime(elapsed + totalTime),
                }));
            }, 1000); // Обновляем каждую секунду

            return intervalId;
        };

        let intervalId;
        updateTotalTime().then((id) => {
            intervalId = id;
        });

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [activeIssue, startTime]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredTracked = useMemo(() => {
        return tracked.filter(entry =>
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.issueUrl.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tracked, searchTerm]);

    const entries = useMemo(() => {
        const grouped = filteredTracked.reduce((acc, entry) => {
            if (!acc[entry.issueUrl]) {
                acc[entry.issueUrl] = { title: entry.title, seconds: 0, issueUrl: entry.issueUrl };
            }
            acc[entry.issueUrl].seconds += entry.seconds;
            return acc;
        }, {});
        return Object.values(grouped).map((e) => ({
            ...e,
            displayTime:
                e.issueUrl === activeIssue && currentTimes[e.issueUrl]
                    ? currentTimes[e.issueUrl]
                    : TimeService.formatTime(e.seconds),
        }));
    }, [filteredTracked, currentTimes, activeIssue]);

    return (
        <>
            <SearchBar onSearch={handleSearch} />
            <TrackedList entries={entries} showTimerControls={true} />
        </>
    );
}