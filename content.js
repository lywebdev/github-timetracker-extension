console.log("GitHub Time Tracker loaded");

let intervalId;

function injectTimerButton() {
    const issueMatch = location.pathname.match(/^\/[^/]+\/[^/]+\/issues\/\d+$/);
    if (!issueMatch) return;

    const container = document.querySelector('[data-testid="issue-metadata-fixed"]');
    if (!container || document.getElementById("track-time-btn")) return;

    const btn = document.createElement("button");
    btn.id = "track-time-btn";
    btn.style = "margin-top: 10px;";
    btn.className = "btn btn-sm";
    btn.textContent = "Start Timer";
    container.append(btn);

    chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
        if (data.activeIssue === location.pathname && data.startTime) {
            btn.textContent = timeStringSince(data.startTime) + " ⏸ Stop";
            intervalId = setInterval(() => {
                btn.textContent = timeStringSince(data.startTime) + " ⏸ Stop";
            }, 1000);
        }
    });

    btn.addEventListener("click", () => {
        chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
            if (data.activeIssue === location.pathname && data.startTime) {
                stopTimer(location.pathname, btn);
            } else {
                startTimer(location.pathname, btn);
            }
        });
    });
}

function startTimer(issueUrl, btn) {
    chrome.storage.local.set({ activeIssue: issueUrl, startTime: new Date().toISOString() });
    btn.textContent = "0m ⏸ Stop";
    intervalId = setInterval(() => {
        chrome.storage.local.get("startTime", (data) => {
            btn.textContent = timeStringSince(data.startTime) + " ⏸ Stop";
        });
    }, 1000);
}

function stopTimer(issueUrl) {
    chrome.storage.local.get(["startTime", "githubToken", "trackedTimes"], async (data) => {
        const timeSpent = (Date.now() - new Date(data.startTime).getTime()) / 1000;

        const token = data.githubToken;
        const { owner, repo, issueNumber } = parseIssueUrl(issueUrl);

        // Название проекта = repo, название задачи пытаемся достать из DOM
        const issueTitle =
            document.querySelector("span.js-issue-title")?.textContent?.trim() ||
            document.querySelector("[data-testid='issue-title']")?.textContent?.trim() ||
            "Untitled";

        const title = `${repo} | ${issueTitle} | #${issueNumber}`;

        if (token) {
            try {
                await postComment(owner, repo, issueNumber, timeSpent, token);
            } catch (err) {
                console.error("Ошибка отправки комментария:", err);
            }
        }

        // Сохраняем в локальную статистику
        const tracked = data.trackedTimes || [];
        tracked.push({
            issueUrl,
            title,
            seconds: timeSpent,
            date: new Date().toISOString().slice(0, 10)
        });
        chrome.storage.local.set({ trackedTimes: tracked });

        chrome.storage.local.remove(["activeIssue", "startTime"]);
        document.getElementById("track-time-btn").textContent = "Start Timer";
        timerActive = false;
        currentIssue = null;
    });
}

function parseIssueUrl(url) {
    const match = url.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
    if (!match) throw new Error("Invalid issue URL");
    return {
        owner: match[1],
        repo: match[2],
        issueNumber: match[3]
    };
}

// async function postComment(owner, repo, issueNumber, seconds, token) {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//
//     const timeString =
//         minutes > 0
//             ? `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds} sec` : ""}`
//             : `${remainingSeconds} sec`;
//
//     const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
//         method: "POST",
//         headers: {
//             "Authorization": `token ${token}`,
//             "Accept": "application/vnd.github+json"
//         },
//         body: JSON.stringify({
//             body: `⏱️ Tracked time: **${timeString}** via GitHub Time Tracker extension.`
//         })
//     });
//
//     if (!response.ok) {
//         const error = await response.json();
//         throw new Error(`GitHub API error: ${error.message}`);
//     }
//
//     console.log("Комментарий успешно отправлен.");
// }

function timeStringSince(startTime) {
    const seconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
}

const observer = new MutationObserver(() => injectTimerButton());
observer.observe(document.body, { childList: true, subtree: true });
