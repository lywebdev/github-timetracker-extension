import { useState, useMemo, useEffect } from 'preact/hooks';
import { TimeService } from '../../../utils/time.js';
import { TrackedList } from './TrackedList.jsx';
import { TimerService } from '../../../utils/timer.js';
import { StorageService } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants.ts';
import { SearchBar } from '../../../components/SearchBar/SearchBar.jsx';

export function CalendarView({ tracked }) {
  const getLocalDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Reset time for local date
    return date;
  };

  const [currentDate, setCurrentDate] = useState(getLocalDate());
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [activeIssue, setActiveIssue] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentTimes, setCurrentTimes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Sync active issue and start time
  useEffect(() => {
    const loadActiveData = async () => {
      const [active, start] = await Promise.all([
        StorageService.get(STORAGE_KEYS.ACTIVE_ISSUE),
        StorageService.get(STORAGE_KEYS.START_TIME),
      ]);
      setActiveIssue(active);
      setStartTime(start);

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
    };
    chrome.storage.local.onChanged.addListener(listener);

    return () => {
      chrome.storage.local.onChanged.removeListener(listener);
    };
  }, []);

  // Update timer for active issue
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

  // Calendar logic
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  lastDayOfMonth.setHours(0, 0, 0, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array(firstDayWeekday).fill(null);

  // Get unique dates with tracked data
  const trackedDates = useMemo(() => {
    const dates = new Set();
    tracked.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (!isNaN(entryDate.getTime())) {
        entryDate.setHours(0, 0, 0, 0); // Normalize date
        const dateStr = entryDate.toISOString().split('T')[0];
        dates.add(dateStr);
      }
    });
    console.log('Tracked dates:', Array.from(dates)); // Debug
    return Array.from(dates);
  }, [tracked]);

  // Filter tracked entries for selected date
  const selectedDayTracked = useMemo(() => {
    const startOfSelected = new Date(selectedDate);
    startOfSelected.setHours(0, 0, 0, 0);
    const endOfSelected = new Date(startOfSelected);
    endOfSelected.setDate(startOfSelected.getDate() + 1);

    const filtered = tracked.filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= startOfSelected && entryDate < endOfSelected;
    });
    console.log('Selected day tracked:', filtered); // Debug
    return filtered;
  }, [tracked, selectedDate]);

  // Calculate total time for selected date
  const selectedDayTotalTime = useMemo(() => {
    const totalSeconds = selectedDayTracked.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
    return TimeService.formatTime(totalSeconds);
  }, [selectedDayTracked]);

  // Filter tracked entries by search term
  const filteredTracked = useMemo(() => {
    return selectedDayTracked.filter(entry =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.issueUrl.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedDayTracked, searchTerm]);

  // Group entries by issueUrl
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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDay = (day) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    newSelectedDate.setHours(0, 0, 0, 0);
    setSelectedDate(newSelectedDate);
  };

  const isDayTracked = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    const today = getLocalDate();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    return trackedDates.includes(dateStr) || dateStr === todayStr;
  };

  const isSelectedDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          className="px-2 py-1 text-sm text-blue-600 hover:bg-gray-200/50 rounded-md"
        >
          ← Prev
        </button>
        <span className="text-sm font-bold">
                    {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
        <button
          onClick={nextMonth}
          className="px-2 py-1 text-sm text-blue-600 hover:bg-gray-200/50 rounded-md"
        >
          Next →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold text-gray-600">{day}</div>
        ))}
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="h-8"></div>
        ))}
        {daysArray.map(day => (
          <div
            key={day}
            className={`h-8 flex items-center justify-center rounded-md ${
              isDayTracked(day)
                ? isSelectedDay(day)
                  ? 'bg-blue-500 text-white cursor-pointer'
                  : 'bg-gray-200/50 cursor-pointer hover:bg-gray-300/50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => isDayTracked(day) && selectDay(day)}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="mb-2 font-bold">
        Total time for {selectedDate.toLocaleDateString('ru-RU')}: {selectedDayTotalTime}
      </div>
      <SearchBar onSearch={handleSearch} />
      <TrackedList entries={entries} showTimerControls={true} />
    </div>
  );
}