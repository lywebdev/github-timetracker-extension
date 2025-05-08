import { injectTimerButton } from './injectButton'

const observer = new MutationObserver(() => injectTimerButton())
observer.observe(document.body, { childList: true, subtree: true })