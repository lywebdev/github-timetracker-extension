import { injectTimerButton } from './shared/timeTracker';

const observer = new MutationObserver(() => {
    injectTimerButton();
});

observer.observe(document.body, { childList: true, subtree: true });
