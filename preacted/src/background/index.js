import { StorageService } from '../utils/storage';
import { GitHubService } from '../utils/github';
import { GitHubStorageService } from '../utils/github-storage';
import { STORAGE_KEYS } from '../utils/constants';

async function handleTimerStop(reason) {
    const { activeIssue, startTime, trackedTimes } = await StorageService.getMultiple([
        STORAGE_KEYS.ACTIVE_ISSUE,
        STORAGE_KEYS.START_TIME,
        STORAGE_KEYS.TRACKED_TIMES,
    ]);

    if (activeIssue && startTime) {
        const timeSpent = (Date.now() - new Date(startTime).getTime()) / 1000;
        console.log(`Stopped due to ${reason}. Tracked ${timeSpent} seconds on ${activeIssue}`);

        let issueInfo;
        try {
            issueInfo = GitHubService.parseIssueUrl(activeIssue);
        } catch (error) {
            console.error('Failed to parse issue URL:', error);
            return;
        }

        const { owner, repo, issueNumber } = issueInfo;
        const title = `(${owner}) ${repo} | Issue #${issueNumber}`;

        const tracked = trackedTimes || [];
        tracked.push({
            issueUrl: activeIssue,
            title,
            seconds: timeSpent,
            date: new Date().toISOString().slice(0, 10),
        });
        await StorageService.set(STORAGE_KEYS.TRACKED_TIMES, tracked);

        const token = await GitHubStorageService.getGitHubToken();
        if (token) {
            try {
                await GitHubService.postComment({ owner, repo, issueNumber, seconds: timeSpent });
            } catch (error) {
                console.error('Failed to post comment:', error);
            }
        }

        await StorageService.removeMultiple([
            STORAGE_KEYS.ACTIVE_ISSUE,
            STORAGE_KEYS.START_TIME,
        ]);
    }
}

chrome.runtime.onStartup.addListener(async () => {
    await handleTimerStop('browser restart');
});

chrome.runtime.onSuspend.addListener(async () => {
    await handleTimerStop('browser closing');
});