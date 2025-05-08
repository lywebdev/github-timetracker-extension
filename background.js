chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
        if (data.activeIssue && data.startTime) {
            const timeSpent = (Date.now() - new Date(data.startTime).getTime()) / 1000;
            console.log(`Stopped due to browser restart. Tracked ${timeSpent} seconds on ${data.activeIssue}`);
            chrome.storage.local.remove(["activeIssue", "startTime"]);
        }
    });
});

chrome.runtime.onSuspend.addListener(() => {
    chrome.storage.local.get(["activeIssue", "startTime"], (data) => {
        if (data.activeIssue && data.startTime) {
            const timeSpent = (Date.now() - new Date(data.startTime).getTime()) / 1000;
            console.log(`Stopped due to browser closing. Tracked ${timeSpent} seconds on ${data.activeIssue}`);
            chrome.storage.local.remove(["activeIssue", "startTime"]);
        }
    });
});
