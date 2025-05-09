import { TimeService } from '../utils/time';
import { GitHubService } from '../utils/github';
import { StorageService } from '../utils/storage';
import { GitHubStorageService } from '../utils/github-storage';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from '../utils/constants';

export class TimerService {
    static async startTimer(issueUrl, btn) {
        await StorageService.set(STORAGE_KEYS.ACTIVE_ISSUE, issueUrl);
        await StorageService.set(STORAGE_KEYS.START_TIME, new Date().toISOString());

        btn.textContent = '0m ⏸ Stop';
        const intervalId = setInterval(async () => {
            const startTime = await StorageService.get(STORAGE_KEYS.START_TIME);
            btn.textContent = `${TimeService.timeStringSince(startTime)} ⏸ Stop`;
        }, TIME_UPDATE_INTERVAL);

        btn.dataset.intervalId = intervalId;
    }

    static async stopTimer(issueUrl, btn) {
        const [startTime, token, trackedTimes] = await Promise.all([
            StorageService.get(STORAGE_KEYS.START_TIME),
            GitHubStorageService.getGitHubToken(),
            StorageService.get(STORAGE_KEYS.TRACKED_TIMES),
        ]);

        console.log('Token in stopTimer:', token); // Для диагностики

        const timeSpent = (Date.now() - new Date(startTime).getTime()) / 1000;
        let issueInfo;
        try {
            issueInfo = GitHubService.parseIssueUrl(issueUrl);
        } catch (error) {
            console.error('Failed to parse issue URL:', error);
            return;
        }

        const { owner, repo, issueNumber } = issueInfo;
        const issueTitle = this.getIssueTitle() || 'Untitled';
        const title = `${repo} | ${issueTitle} | #${issueNumber}`;

        if (token) {
            try {
                await GitHubService.postComment({ owner, repo, issueNumber, seconds: timeSpent });
                console.log('Comment posted successfully');
            } catch (error) {
                console.error('Failed to post comment:', error);
            }
        } else {
            console.warn('No GitHub token found, skipping comment posting');
        }

        const tracked = trackedTimes || [];
        tracked.push({
            issueUrl,
            title,
            seconds: timeSpent,
            date: new Date().toISOString().slice(0, 10),
        });

        await StorageService.set(STORAGE_KEYS.TRACKED_TIMES, tracked);
        await Promise.all([
            StorageService.remove(STORAGE_KEYS.ACTIVE_ISSUE),
            StorageService.remove(STORAGE_KEYS.START_TIME),
        ]);

        clearInterval(btn.dataset.intervalId);
        btn.textContent = 'Start Timer';
    }

    static getIssueTitle() {
        return (
            document.querySelector('span.js-issue-title')?.textContent?.trim() ||
            document.querySelector("[data-testid='issue-title']")?.textContent?.trim()
        );
    }
}