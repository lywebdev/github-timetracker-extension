import { parseIssueUrl, postComment } from '../utils/github'
import { timeStringSince } from '../utils/time'

export function startTimer(issueUrl, btn) {
    chrome.storage.local.set({ activeIssue: issueUrl, startTime: new Date().toISOString() })
    btn.textContent = "0m ⏸ Stop"
    const intervalId = setInterval(() => {
        chrome.storage.local.get("startTime", (data) => {
            btn.textContent = timeStringSince(data.startTime) + " ⏸ Stop"
        })
    }, 1000)
    btn.dataset.intervalId = intervalId
}

export async function stopTimer(issueUrl, btn) {
    const data = await chrome.storage.local.get(["startTime", "githubToken", "trackedTimes"])
    const timeSpent = (Date.now() - new Date(data.startTime).getTime()) / 1000

    const token = data.githubToken
    const { owner, repo, issueNumber } = parseIssueUrl(issueUrl)

    const issueTitle =
        document.querySelector("span.js-issue-title")?.textContent?.trim() ||
        document.querySelector("[data-testid='issue-title']")?.textContent?.trim() ||
        "Untitled"

    const title = `${repo} | ${issueTitle} | #${issueNumber}`

    if (token) {
        try {
            await postComment(owner, repo, issueNumber, timeSpent, token)
        } catch (err) {
            console.error("Ошибка отправки комментария:", err)
        }
    }

    // Сохраняем в локальную статистику
    const tracked = data.trackedTimes || []
    tracked.push({
        issueUrl,
        title,
        seconds: timeSpent,
        date: new Date().toISOString().slice(0, 10)
    })
    await chrome.storage.local.set({ trackedTimes: tracked })

    chrome.storage.local.remove(["activeIssue", "startTime"])
    clearInterval(btn.dataset.intervalId)
    btn.textContent = "Start Timer"
}