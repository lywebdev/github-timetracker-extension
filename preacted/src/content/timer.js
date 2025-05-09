import { TimeService } from '../utils/time';
import { GitHubService } from '../utils/github';
import { StorageService } from '../utils/storage';
import { GitHubStorageService } from '../utils/github-storage';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from '../utils/constants';

export class TimerService {
    static async getTotalTimeForIssue(issueUrl) {
        const trackedTimes = await StorageService.get(STORAGE_KEYS.TRACKED_TIMES) || [];
        return trackedTimes
            .filter((entry) => entry.issueUrl === issueUrl)
            .reduce((total, entry) => total + (entry.seconds || 0), 0);
    }

    static async startTimer(issueUrl, btn) {
        await StorageService.set(STORAGE_KEYS.ACTIVE_ISSUE, issueUrl);
        await StorageService.set(STORAGE_KEYS.START_TIME, new Date().toISOString());

        const totalTime = await this.getTotalTimeForIssue(issueUrl);
        btn.textContent = `${TimeService.formatTime(0, totalTime)} ⏸ Stop`;
        const intervalId = setInterval(async () => {
            const startTime = await StorageService.get(STORAGE_KEYS.START_TIME);
            if (!startTime || isNaN(new Date(startTime).getTime())) {
                clearInterval(intervalId);
                btn.textContent = `${TimeService.formatTime(0, totalTime)} Start Timer`;
                return;
            }
            btn.textContent = `${TimeService.timeStringSince(startTime, totalTime)} ⏸ Stop`;
        }, TIME_UPDATE_INTERVAL);

        btn.dataset.intervalId = intervalId;
    }

    static async stopTimer(issueUrl, btn) {
        const [startTime, token, trackedTimes] = await Promise.all([
            StorageService.get(STORAGE_KEYS.START_TIME),
            GitHubStorageService.getGitHubToken(),
            StorageService.get(STORAGE_KEYS.TRACKED_TIMES),
        ]);

        if (!startTime || isNaN(new Date(startTime).getTime())) {
            console.error('Invalid startTime:', startTime);
            clearInterval(btn.dataset.intervalId);
            btn.textContent = 'Start Timer';
            await StorageService.removeMultiple([
                STORAGE_KEYS.ACTIVE_ISSUE,
                STORAGE_KEYS.START_TIME,
            ]);
            return;
        }

        const timeSpent = (Date.now() - new Date(startTime).getTime()) / 1000;
        let issueInfo;
        try {
            issueInfo = GitHubService.parseIssueUrl(issueUrl);
        } catch (error) {
            console.error('Failed to parse issue URL:', error);
            clearInterval(btn.dataset.intervalId);
            btn.textContent = 'Start Timer';
            await StorageService.removeMultiple([
                STORAGE_KEYS.ACTIVE_ISSUE,
                STORAGE_KEYS.START_TIME,
            ]);
            return;
        }

        const { owner, repo, issueNumber } = issueInfo;
        const issueTitle = this.getIssueTitle() || 'Untitled';
        const title = `(${owner}) ${repo} | ${issueTitle} | #${issueNumber}`;

        if (token) {
            try {
                await GitHubService.postComment({ owner, repo, issueNumber, seconds: timeSpent });
            } catch (error) {
                console.error('Failed to post comment:', error);
            }
        }

        const tracked = trackedTimes || [];
        tracked.push({
            issueUrl,
            title,
            seconds: timeSpent,
            date: new Date().toISOString().slice(0, 10),
        });

        await StorageService.set(STORAGE_KEYS.TRACKED_TIMES, tracked);
        await StorageService.removeMultiple([
            STORAGE_KEYS.ACTIVE_ISSUE,
            STORAGE_KEYS.START_TIME,
        ]);

        const totalTime = await this.getTotalTimeForIssue(issueUrl);
        clearInterval(btn.dataset.intervalId);
        btn.textContent = `${TimeService.formatTime(0, totalTime)} Start Timer`;
    }

    static getIssueTitle() {
        return (
            document.querySelector('span.js-issue-title')?.textContent?.trim() ||
            document.querySelector("[data-testid='issue-title']")?.textContent?.trim()
        );
    }
}