import { TimerService } from './timer';
import { TimeService } from '../utils/time';
import { StorageService } from '../utils/storage';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from '../utils/constants';

export async function injectTimerButton() {
    if (!isIssuePage()) {
        return;
    }

    const container = document.querySelector('[data-testid="issue-metadata-fixed"]');
    if (!container || document.getElementById('track-time-btn')) {
        return;
    }

    const btn = createTimerButton();
    container.append(btn);

    const { activeIssue, startTime } = await getStorageData();
    const totalTime = await TimerService.getTotalTimeForIssue(location.pathname);
    if (activeIssue === location.pathname && startTime && !isNaN(new Date(startTime).getTime())) {
        updateButtonText(btn, startTime, totalTime);
        startButtonUpdateInterval(btn, startTime, totalTime);
    } else {
        btn.textContent = `${TimeService.formatTime(0, totalTime)} Start Timer`;
    }

    btn.addEventListener('click', async () => {
        const { activeIssue, startTime } = await getStorageData();
        if (activeIssue === location.pathname && startTime && !isNaN(new Date(startTime).getTime())) {
            await TimerService.stopTimer(location.pathname, btn);
        } else {
            await TimerService.startTimer(location.pathname, btn);
        }
    });

    window.addEventListener('unload', () => {
        if (btn.dataset.intervalId) {
            clearInterval(btn.dataset.intervalId);
            delete btn.dataset.intervalId;
        }
    });
}

function isIssuePage() {
    return location.pathname.match(/^\/[^/]+\/[^/]+\/issues\/\d+$/);
}

function createTimerButton() {
    const btn = document.createElement('button');
    btn.id = 'track-time-btn';
    btn.style.marginTop = '10px';
    btn.className = 'btn btn-sm';
    btn.textContent = 'Start Timer';
    return btn;
}

async function getStorageData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.ACTIVE_ISSUE, STORAGE_KEYS.START_TIME], (data) => {
            resolve({
                activeIssue: data[STORAGE_KEYS.ACTIVE_ISSUE] || null,
                startTime: data[STORAGE_KEYS.START_TIME] || null,
            });
        });
    });
}

function updateButtonText(btn, startTime, totalTime) {
    btn.textContent = `${TimeService.timeStringSince(startTime, totalTime)} ⏸ Stop`;
}

function startButtonUpdateInterval(btn, startTime, totalTime) {
    const intervalId = setInterval(() => {
        updateButtonText(btn, startTime, totalTime);
    }, TIME_UPDATE_INTERVAL);
    btn.dataset.intervalId = intervalId;
}