import { useEffect, useState } from 'preact/hooks';
import './TrackedList.css';
import { TimerService } from '../../../utils/timer.js';
import { TimeService } from '../../../utils/time.js';
import { StorageService } from '../../../utils/storage.js';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from '../../../utils/constants.js';

export function TrackedList({ entries, showTimerControls = false }) {
    const [activeIssue, setActiveIssue] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [currentTimes, setCurrentTimes] = useState({});

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
                const elapsed = (Date.now() - new Date(start).getTime()) / 1000;
                setCurrentTimes((prev) => ({
                    ...prev,
                    [active]: TimeService.formatTime(elapsed),
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

    // Обновление времени для активной задачи (только текущая сессия)
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

    // Обработчик клика по кнопке Start/Stop
    const handleTimerClick = async (entry) => {
        console.log('handleTimerClick:', entry.issueUrl, 'action:', entry.issueUrl === activeIssue ? 'stop' : 'start');
        console.log('entry', entry);
        if (entry.issueUrl === activeIssue && startTime && !isNaN(new Date(startTime).getTime())) {
            // Останавливаем таймер
            const result = await TimerService.stopTimer(entry.issueUrl, null, entry.title);
            setCurrentTimes((prev) => {
                const newTimes = { ...prev };
                delete newTimes[entry.issueUrl];
                return newTimes;
            });
            chrome.runtime.sendMessage({ action: 'timerStopped', issueUrl: entry.issueUrl });
        } else {
            // Запускаем таймер
            await TimerService.startTimer(entry.issueUrl);
            // Не устанавливаем currentTimes здесь, полагаемся на useEffect
            chrome.runtime.sendMessage({ action: 'timerStarted', issueUrl: entry.issueUrl });
        }
    };

    return (
        <div className="tracked-list">
            {entries.map((entry, i) => (
                <div key={entry.issueUrl || i} className="tracked-entry">
                    <div className="tracked-title">{entry.title}</div>
                    <div className="tracked-meta">
                        {entry.displayTime} {entry.date && `on ${entry.date}`} |{' '}
                        <a href={`https://github.com${entry.issueUrl}`} target="_blank">
                            View
                        </a>
                        {showTimerControls && (
                            <>
                                {' | '}
                                <span
                                    onClick={() => handleTimerClick(entry)}
                                    style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
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