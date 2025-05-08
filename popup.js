function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
}

document.getElementById("saveToken").addEventListener("click", () => {
    const token = document.getElementById("token").value;
    chrome.storage.local.set({ githubToken: token });
});

chrome.storage.local.get("githubToken", (data) => {
    if (data.githubToken) document.getElementById("token").value = data.githubToken;
});

const stats = document.getElementById("stats");

function showSummary() {
    chrome.storage.local.get("trackedTimes", (data) => {
        const tracked = data.trackedTimes || [];
        const grouped = tracked.reduce((acc, entry) => {
            if (!acc[entry.issueUrl]) {
                acc[entry.issueUrl] = { title: entry.title, seconds: 0 };
            }
            acc[entry.issueUrl].seconds += entry.seconds;
            return acc;
        }, {});

        stats.innerHTML = "";
        for (const [url, entry] of Object.entries(grouped)) {
            const div = document.createElement("div");
            div.className = "issue";
            div.innerHTML = `
                <div class="title">${entry.title}</div>
                <div class="time">${formatTime(entry.seconds)} | <a href="https://github.com${url}" target="_blank">View</a></div>
            `;
            stats.appendChild(div);
        }
    });
}

function showHistory() {
    chrome.storage.local.get("trackedTimes", (data) => {
        const tracked = (data.trackedTimes || []).slice(-10).reverse();
        stats.innerHTML = "";
        for (const entry of tracked) {
            const div = document.createElement("div");
            div.className = "issue";
            div.innerHTML = `
                <div class="title">${entry.title}</div>
                <div class="time">${formatTime(entry.seconds)} on ${entry.date} | <a href="https://github.com${entry.issueUrl}" target="_blank">View</a></div>
            `;
            stats.appendChild(div);
        }
    });
}

document.getElementById("tab-summary").addEventListener("click", () => {
    setActiveTab("summary");
    showSummary();
});

document.getElementById("tab-history").addEventListener("click", () => {
    setActiveTab("history");
    showHistory();
});

function setActiveTab(name) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById("tab-" + name).classList.add("active");
}

setActiveTab("summary");
showSummary();
