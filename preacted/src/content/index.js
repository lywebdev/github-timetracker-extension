import { injectTimerButton, resetInjectedFlag } from './injectTimerButton.js';

console.log('content script loaded, timestamp:', Date.now());

// Дебаунсинг для предотвращения множественных вызовов
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Проверка, является ли страница Issue
function isIssuePage() {
    return location.pathname.match(/^\/[^/]+\/[^/]+\/issues\/\d+$/);
}

// Дебаунсинг для injectTimerButton
const debouncedInjectTimerButton = debounce(injectTimerButton, 100);

// Рекурсивная проверка контейнера
function checkContainer(attempts = 10, delay = 1000) {
    console.log(`checkContainer: attempts left ${attempts}, pathname: ${location.pathname}`);
    const container = document.querySelector('[data-testid="issue-metadata-fixed"]');
    if (container || attempts <= 0) {
        console.log('checkContainer: injecting button, container found:', !!container);
        debouncedInjectTimerButton();
        return;
    }
    setTimeout(() => checkContainer(attempts - 1, delay), delay);
}

// Инициализация при загрузке
if (isIssuePage()) {
    checkContainer();
}

// Отслеживание изменений DOM и URL для SPA-навигации
let lastPathname = location.pathname;
const observer = new MutationObserver(() => {
    if (location.pathname !== lastPathname) {
        console.log(`MutationObserver: pathname changed from ${lastPathname} to ${location.pathname}`);
        resetInjectedFlag(); // Сбрасываем isInjected при смене пути
        lastPathname = location.pathname;
        if (isIssuePage()) {
            checkContainer();
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// Отслеживание контейнера
const containerObserver = new MutationObserver((mutations) => {
    // Проверяем, есть ли уже кнопка
    const buttonExists = document.querySelector('#track-time-btn');
    if (buttonExists) {
        return; // Пропускаем, если кнопка уже создана
    }
    console.log('containerObserver: container changed');
    debouncedInjectTimerButton();
});
const container = document.querySelector('[data-testid="issue-metadata-fixed"]');
if (container) {
    console.log('containerObserver: initial container found');
    containerObserver.observe(container, { childList: true }); // Убрали subtree: true
}

// Динамическое отслеживание появления контейнера
const bodyObserver = new MutationObserver(() => {
    const newContainer = document.querySelector('[data-testid="issue-metadata-fixed"]');
    if (newContainer && !container) {
        console.log('bodyObserver: new container found');
        containerObserver.observe(newContainer, { childList: true }); // Убрали subtree: true
        debouncedInjectTimerButton();
    }
});
bodyObserver.observe(document.body, { childList: true, subtree: true });

// Слушатель popstate для навигации назад/вперёд
window.addEventListener('popstate', () => {
    if (location.pathname !== lastPathname) {
        console.log(`popstate: pathname changed to ${location.pathname}`);
        resetInjectedFlag(); // Сбрасываем isInjected
        lastPathname = location.pathname;
        if (isIssuePage()) {
            checkContainer();
        }
    }
});

// Патч pushState для перехвата клиентской навигации
const originalPushState = history.pushState;
history.pushState = function (...args) {
    originalPushState.apply(this, args);
    if (location.pathname !== lastPathname) {
        console.log(`pushState: pathname changed to ${location.pathname}`);
        resetInjectedFlag(); // Сбрасываем isInjected
        lastPathname = location.pathname;
        if (isIssuePage()) {
            checkContainer();
        }
    }
};

// Очистка при выходе
window.addEventListener('unload', () => {
    console.log('unload: cleaning up observers and pushState');
    observer.disconnect();
    containerObserver.disconnect();
    bodyObserver.disconnect();
    history.pushState = originalPushState;
});