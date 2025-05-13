import { useMemo, useState, useEffect } from 'preact/hooks';
import { TimeService } from '../../../utils/time.js';
import { TrackedList } from './TrackedList.jsx';
import { TimerService } from '../../../utils/timer.js';
import { StorageService } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants.js';
import { SearchBar } from '../../../components/SearchBar/SearchBar.jsx';

export function SummaryView({ tracked }) {
    const [activeIssue, setActiveIssue] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [currentTimes, setCurrentTimes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [todayTracked, setTodayTracked] = useState([]);

    useEffect(() => {
        const loadActiveData = async () => {
            const [active, start, allTracked] = await Promise.all([
                StorageService.get(STORAGE_KEYS.ACTIVE_ISSUE),
                StorageService.get(STORAGE_KEYS.START_TIME),
                StorageService.get(STORAGE_KEYS.TRACKED_TIMES),
            ]);
            setActiveIssue(active);
            setStartTime(start);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const filteredToday = (allTracked || []).filter(entry => {
                const entryDate = new Date(entry.date);
                if (isNaN(entryDate.getTime())) {
                    console.warn('Invalid date for entry:', entry);
                    return false;
                }
                return entryDate >= today && entryDate < tomorrow;
            });
            console.log('Filtered today tracked:', filteredToday);
            setTodayTracked(filteredToday);

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

        const listener = (changes) => {
            if (changes[STORAGE_KEYS.ACTIVE_ISSUE]) {
                setActiveIssue(changes[STORAGE_KEYS.ACTIVE_ISSUE].newValue);
            }
            if (changes[STORAGE_KEYS.START_TIME]) {
                setStartTime(changes[STORAGE_KEYS.START_TIME].newValue);
            }
            if (changes[STORAGE_KEYS.TRACKED_TIMES]) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const updatedTracked = changes[STORAGE_KEYS.TRACKED_TIMES].newValue || [];
                const filteredToday = updatedTracked.filter(entry => {
                    const entryDate = new Date(entry.date);
                    if (isNaN(entryDate.getTime())) {
                        console.warn('Invalid date for entry:', entry);
                        return false;
                    }
                    return entryDate >= today && entryDate < tomorrow;
                });
                console.log('Updated today tracked from storage change:', filteredToday);
                setTodayTracked(filteredToday);
            }
        };
        chrome.storage.local.onChanged.addListener(listener);

        return () => {
            chrome.storage.local.onChanged.removeListener(listener);
        };
    }, []);

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
            }, 1000);

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

    const todayTotalTime = useMemo(() => {
        console.log('Calculating todayTotalTime, tracked:', todayTracked);
        const totalSeconds = todayTracked.reduce((sum, entry) => {
            console.log('Processing entry:', entry);
            return sum + (entry.seconds || 0);
        }, 0);
        console.log('Total seconds today:', totalSeconds);
        return TimeService.formatTime(totalSeconds);
    }, [todayTracked]);

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
          <div className="mb-2 font-bold">
              Total time tracked today: {todayTotalTime}
          </div>
          <SearchBar onSearch={handleSearch} />
          <TrackedList entries={entries} showTimerControls={true} />
      </>
    );
}