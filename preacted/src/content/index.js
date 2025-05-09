import { injectTimerButton } from './injectTimerButton.js';

console.log('content popup.jsx');

const observer = new MutationObserver(() => injectTimerButton())
observer.observe(document.body, { childList: true, subtree: true })