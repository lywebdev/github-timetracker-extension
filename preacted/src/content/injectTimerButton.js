import { TimerService } from './timer';
import { TimeService } from '../utils/time';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from '../utils/constants';

export async function injectTimerButton() {
    console.log('заинжектено');
    // Проверяем, что текущая страница — это GitHub Issue
    if (!isIssuePage()) {
        return;
    }

    // Находим контейнер для кнопки
    const container = document.querySelector('[data-testid="issue-metadata-fixed"]');
    if (!container || document.getElementById('track-time-btn')) {
        return;
    }

    // Создаём кнопку
    const btn = createTimerButton();
    container.append(btn);

    // Проверяем, активен ли таймер для текущей страницы
    const { activeIssue, startTime } = await getStorageData();
    if (activeIssue === location.pathname && startTime) {
        updateButtonText(btn, startTime);
        startButtonUpdateInterval(btn, startTime);
    }

    // Добавляем обработчик клика
    btn.addEventListener('click', async () => {
        console.log('клик по кнопке');
        const { activeIssue, startTime } = await getStorageData();
        if (activeIssue === location.pathname && startTime) {
            await TimerService.stopTimer(location.pathname, btn);
        } else {
            await TimerService.startTimer(location.pathname, btn);
        }
    });

    // Очищаем интервал при выходе со страницы
    window.addEventListener('unload', () => {
        if (btn.dataset.intervalId) {
            clearInterval(btn.dataset.intervalId);
            delete btn.dataset.intervalId; // Удаляем для предотвращения повторных попыток очистки
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

function updateButtonText(btn, startTime) {
    btn.textContent = `${TimeService.timeStringSince(startTime)} ⏸ Stop`;
}

function startButtonUpdateInterval(btn, startTime) {
    const intervalId = setInterval(() => {
        updateButtonText(btn, startTime);
    }, TIME_UPDATE_INTERVAL);
    btn.dataset.intervalId = intervalId;
}