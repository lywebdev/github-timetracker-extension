import { useEffect, useState } from 'preact/hooks';
import { TimerService } from '../../../utils/timer.js';
import { TimeService } from '../../../utils/time.js';
import { StorageService } from '../../../utils/storage.js';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from '../../../utils/constants.ts';

export function TrackedList({ entries, showTimerControls = false }) {
    const [activeIssue, setActiveIssue] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [currentTimes, setCurrentTimes] = useState({});

    useEffect(() => {
        const loadActiveData = async () => {
            const [active, start] = await Promise.all([
                StorageService.get(STORAGE_KEYS.ACTIVE_ISSUE),
                StorageService.get(STORAGE_KEYS.START_TIME),
            ]);
            setActiveIssue(active);
            setStartTime(start);

            if (active && start && !isNaN(new Date(start).getTime())) {
                const elapsed = (Date.now() - new Date(start).getTime()) / 1000;
                setCurrentTimes((prev) => ({
                    ...prev,
                    [active]: TimeService.formatTime(elapsed),
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
        };
        chrome.storage.local.onChanged.addListener(listener);

        return () => {
            chrome.storage.local.onChanged.removeListener(listener);
        };
    }, []);

    useEffect(() => {
        if (!showTimerControls) return;

        const updateTimes = async () => {
            if (!activeIssue || !startTime || isNaN(new Date(startTime).getTime())) {
                setCurrentTimes((prev) => {
                    const newTimes = { ...prev };
                    delete newTimes[activeIssue];
                    return newTimes;
                });
                return;
            }

            const intervalId = setInterval(() => {
                const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
                setCurrentTimes((prev) => ({
                    ...prev,
                    [activeIssue]: TimeService.formatTime(elapsed),
                }));
            }, TIME_UPDATE_INTERVAL);

            return intervalId;
        };

        let intervalId;
        updateTimes().then((id) => {
            intervalId = id;
        });

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [activeIssue, startTime, showTimerControls]);

    const handleTimerClick = async (entry) => {
        console.log('handleTimerClick:', entry.issueUrl, 'action:', entry.issueUrl === activeIssue ? 'stop' : 'start');
        console.log('entry', entry);
        if (entry.issueUrl === activeIssue && startTime && !isNaN(new Date(startTime).getTime())) {
            const result = await TimerService.stopTimer(entry.issueUrl, null, entry.title);
            setCurrentTimes((prev) => {
                const newTimes = { ...prev };
                delete newTimes[entry.issueUrl];
                return newTimes;
            });
            chrome.runtime.sendMessage({ action: 'timerStopped', issueUrl: entry.issueUrl });
        } else {
            await TimerService.startTimer(entry.issueUrl);
            chrome.runtime.sendMessage({ action: 'timerStarted', issueUrl: entry.issueUrl });
        }
    };

    return (
      <div className="py-1 text-sm">
          {entries.map((entry, i) => (
            <div key={entry.issueUrl || i} className="border-b border-gray-300 mb-2 pb-[7px] last:border-b-0 last:mb-0 last:pb-0">
                <div className="leading-[145%]">{entry.title}</div>
                <div className="text-[13px] text-gray-600 mt-[5px]">
                    {entry.displayTime} {entry.date && `on ${entry.date}`} |{' '}
                    <a href={`https://github.com${entry.issueUrl}`} target="_blank" className="text-blue-600 no-underline hover:underline">
                        View
                    </a>
                    {showTimerControls && (
                      <>
                          {' | '}
                          <span
                            onClick={() => handleTimerClick(entry)}
                            className="text-blue-700 cursor-pointer hover:underline"
                          >
                                    {entry.issueUrl === activeIssue &&
                                    startTime &&
                                    !isNaN(new Date(startTime).getTime())
                                      ? `${currentTimes[entry.issueUrl] || '00:00:00'} Stop`
                                      : 'Start'}
                                </span>
                      </>
                    )}
                </div>
            </div>
          ))}
      </div>
    );
}