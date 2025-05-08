function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return h > 0 ? `${h}h ${remM}m` : `${remM}m`;
}

document.getElementById("save-token").addEventListener("click", () => {
    const token = document.getElementById("token").value.trim();
    chrome.storage.local.set({ githubToken: token }, () => {
        alert("Token saved");
    });
});

document.getElementById("clear").addEventListener("click", () => {
    chrome.storage.local.remove("trackedTimes", () => {
        location.reload();
    });
});

chrome.storage.local.get(["trackedTimes", "githubToken"], (data) => {
    document.getElementById("token").value = data.githubToken || "";

    const stats = document.getElementById("stats");
    const tracked = data.trackedTimes || [];

    const grouped = tracked.reduce((acc, entry) => {
        if (!acc[entry.issueUrl]) {
            acc[entry.issueUrl] = { title: entry.title, seconds: 0 };
        }
        acc[entry.issueUrl].seconds += entry.seconds;
        return acc;
    }, {});

    if (Object.keys(grouped).length === 0) {
        stats.textContent = "No data yet.";
        return;
    }

    for (const [url, { title, seconds }] of Object.entries(grouped)) {
        const div = document.createElement("div");
        div.className = "issue";
        div.innerHTML = `
      <div class="title">${title}</div>
      <div class="time">${formatTime(seconds)} | <a href="https://github.com${url}" target="_blank">View</a></div>
    `;
        stats.appendChild(div);
    }
});
