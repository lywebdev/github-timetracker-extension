import { startTimer, stopTimer } from './timer'
import { timeStringSince } from '../utils/time'

export function injectTimerButton() {
    const issueMatch = location.pathname.match(/^\/[^/]+\/[^/]+\/issues\/\d+$/)
    if (!issueMatch) return

    const container = document.querySelector('[data-testid="issue-metadata-fixed"]')
    if (!container || document.getElementById("track-time-btn")) return

    const btn = document.createElement("button")
    btn.id = "track-time-btn"
    btn.style = "margin-top: 10px;"
    btn.className = "btn btn-sm"
    btn.textContent = "Start Timer"
    container.append(btn)

    chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
        if (data.activeIssue === location.pathname && data.startTime) {
            btn.textContent = timeStringSince(data.startTime) + " ⏸ Stop"
            const intervalId = setInterval(() => {
                btn.textContent = timeStringSince(data.startTime) + " ⏸ Stop"
            }, 1000)
            btn.dataset.intervalId = intervalId
        }
    })

    btn.addEventListener("click", () => {
        chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
            if (data.activeIssue === location.pathname && data.startTime) {
                stopTimer(location.pathname, btn)
            } else {
                startTimer(location.pathname, btn)
            }
        })
    })
}