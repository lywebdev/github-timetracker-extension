let timerActive = false;
let currentIssue = null;
let intervalId = null;

console.log("init GitHub Time Tracker");

function injectTimerButton() {
    console.log('injectTimerButton');
    if (!/^\/[^/]+\/[^/]+\/issues\/\d+$/.test(location.pathname)) {
        const oldBtn = document.getElementById("track-time-btn");
        if (oldBtn) oldBtn.remove();
        return;
    }

    const isIssue = /^\/[^/]+\/[^/]+\/issues\/\d+$/.test(location.pathname);
    console.log('regexp', isIssue);
    if (!isIssue) return;

    // Уже вставили кнопку?
    if (document.getElementById("track-time-btn")) return;

    const targetContainer = document.querySelector('[data-testid="issue-metadata-fixed"] .cySYaL');
    if (!targetContainer) return;

    const btn = document.createElement("button");
    btn.id = "track-time-btn";
    btn.textContent = "Start Timer";
    btn.style = `
        margin-top: 8px;
        padding: 6px 12px;
        font-size: 14px;
        background-color: #2da44e;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    `;

    btn.addEventListener("click", () => {
        if (!timerActive) {
            startTimer(location.pathname);
        } else {
            stopTimer(location.pathname);
        }
    });

    chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
        if (data.activeIssue === location.pathname && data.startTime) {
            timerActive = true;
            currentIssue = data.activeIssue;
            btn.textContent = "Stop Timer";
        }
    });

    targetContainer.appendChild(btn);
}

function startTimer(issueUrl) {
    timerActive = true;
    currentIssue = issueUrl;

    const startTime = new Date().toISOString();
    chrome.storage.local.set({ activeIssue: issueUrl, startTime });

    updateButtonText(); // сразу показать 0:00
    intervalId = setInterval(updateButtonText, 1000);
}

function stopTimer(issueUrl) {
    chrome.storage.local.get(["startTime", "githubToken", "trackedTimes"], async (data) => {
        const timeSpent = (Date.now() - new Date(data.startTime).getTime()) / 1000;
        const minutes = Math.round(timeSpent / 60);

        const token = data.githubToken;
        if (token) {
            try {
                const { owner, repo, issueNumber } = parseIssueUrl(issueUrl);
                await postComment(owner, repo, issueNumber, minutes, token);
            } catch (err) {
                console.error("Ошибка отправки комментария:", err);
            }
        }

        // Сохраняем в историю
        const tracked = data.trackedTimes || [];
        const title = document.querySelector('[data-testid="issue-title"]')?.textContent?.trim() || "Untitled";
        tracked.push({
            issueUrl,
            title,
            seconds: timeSpent,
            date: new Date().toISOString().slice(0, 10)
        });

        // Ограничим размер истории
        if (tracked.length > 500) tracked.shift();

        chrome.storage.local.set({ trackedTimes: tracked });

        chrome.storage.local.remove(["activeIssue", "startTime"]);
        document.getElementById("track-time-btn").textContent = "Start Timer";

        clearInterval(intervalId);
        intervalId = null;

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
        issueNumber: match[3],
    };
}

function updateButtonText() {
    chrome.storage.local.get(["startTime"], (data) => {
        const start = new Date(data.startTime);
        const diff = Math.floor((Date.now() - start.getTime()) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;

        const btn = document.getElementById("track-time-btn");
        if (btn) btn.textContent = `Stop Timer (${mins}:${secs.toString().padStart(2, '0')})`;
    });
}


async function postComment(owner, repo, issueNumber, minutes, token) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        method: "POST",
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github+json",
        },
        body: JSON.stringify({
            body: `⏱️ Tracked time: **${minutes} minute(s)** via GitHub Time Tracker extension.`,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`GitHub API error: ${error.message}`);
    }

    console.log("Комментарий успешно отправлен.");
}

// Проверяем загрузку DOM
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectTimerButton);
} else {
    injectTimerButton();
}

// Следим за PJAX-навигацией
let lastPath = location.pathname;

const observer = new MutationObserver(() => {
    const currentPath = location.pathname;
    if (currentPath !== lastPath) {
        console.log("Path changed:", currentPath);
        lastPath = currentPath;
        injectTimerButton();
    }
});
observer.observe(document.body, { childList: true, subtree: true });

