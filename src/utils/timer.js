import { TimeService } from './time.js';
import { GitHubService } from './github.js';
import { StorageService } from './storage.js';
import { GitHubStorageService } from './github-storage.js';
import { STORAGE_KEYS, TIME_UPDATE_INTERVAL } from './constants.js';
import { IssueStorageService } from "./issue-storage.js";

export class TimerService {
    /**
     * Calculates the total time tracked for a given issue URL
     * @param {string} issueUrl - The URL of the issue
     * @returns {Promise<number>} The total time in seconds
     */
    static async getTotalTimeForIssue(issueUrl) {
        const trackedTimes = (await StorageService.get(STORAGE_KEYS.TRACKED_TIMES)) || [];
        return trackedTimes
            .filter(entry => entry.issueUrl === issueUrl)
            .reduce((total, entry) => total + (entry.seconds || 0), 0);
    }

    /**
     * Starts the timer for a given issue URL
     * @param {string} issueUrl - The URL of the issue
     * @param {HTMLButtonElement | null} buttonElement - The button element associated with the timer (optional)
     * @returns {Promise<{ issueUrl: string; totalTime: number; intervalId: number | null; isRunning: boolean; }>} An object containing issue details and timer status
     */
    static async startTimer(issueUrl, buttonElement = null) {
        try {
            const [activeIssueUrl, startTime, issue] = await Promise.all([
                StorageService.get(STORAGE_KEYS.ACTIVE_ISSUE),
                StorageService.get(STORAGE_KEYS.START_TIME),
                IssueStorageService.getByUrl(issueUrl),
            ]);

            if (activeIssueUrl && startTime && activeIssueUrl !== issueUrl) {
                console.log(`Останавливаем таймер для предыдущей задачи: ${activeIssueUrl}`);
                await this.stopTimer(activeIssueUrl, buttonElement);
            }

            const issueInfo = GitHubService.parseIssueUrl(issueUrl);
            const { owner, repo, issueNumber } = issueInfo;
            const issueTitle = this.getIssueTitle() || 'Untitled';
            const fullIssueTitle = `(${owner}) ${repo} | ${issueTitle} | #${issueNumber}`;

            await Promise.all([
                StorageService.set(STORAGE_KEYS.ACTIVE_ISSUE, issueUrl),
                StorageService.set(STORAGE_KEYS.START_TIME, new Date().toISOString()),
            ]);

            if (!issue) {
                await IssueStorageService.add({ url: issueUrl, title: fullIssueTitle });
            }

            const totalTime = await this.getTotalTimeForIssue(issueUrl);
            let intervalId = null;

            if (buttonElement) {
                buttonElement.textContent = `${TimeService.formatTime(0, totalTime)} ⏸ Stop`;
                intervalId = window.setInterval(async () => {
                    const startTime = await StorageService.get(STORAGE_KEYS.START_TIME);
                    if (!startTime || isNaN(new Date(startTime).getTime())) {
                        clearInterval(intervalId);
                        buttonElement.textContent = `${TimeService.formatTime(0, totalTime)} Start Timer`;
                        return;
                    }
                    buttonElement.textContent = `${TimeService.timeStringSince(startTime, totalTime)} ⏸ Stop`;
                }, TIME_UPDATE_INTERVAL);
                buttonElement.dataset.intervalId = intervalId.toString();
            }

            return { issueUrl, totalTime, intervalId, isRunning: true };
        } catch (error) {
            console.error('Не удалось запустить таймер:', error);
            if (buttonElement?.dataset.intervalId) {
                clearInterval(parseInt(buttonElement.dataset.intervalId, 10));
                buttonElement.textContent = 'Start Timer';
            }
            await StorageService.removeMultiple([
                STORAGE_KEYS.ACTIVE_ISSUE,
                STORAGE_KEYS.START_TIME,
            ]);
            return { issueUrl, totalTime: 0, intervalId: null, isRunning: false };
        }
    }

    /**
     * Stops the timer for a given issue URL.
     * @param {string} issueUrl - The URL of the issue.
     * @param {HTMLButtonElement | null} buttonElement - The button element associated with the timer (optional).
     * @returns {Promise<{ issueUrl: string; totalTime: number; isRunning: boolean }>} An object containing issue details and timer status.
     */
    static async stopTimer(issueUrl, buttonElement = null) {
        try {
            const [startTime, githubToken, trackedTimes, existingIssue] = await Promise.all([
                StorageService.get(STORAGE_KEYS.START_TIME),
                GitHubStorageService.getGitHubToken(),
                StorageService.get(STORAGE_KEYS.TRACKED_TIMES),
                IssueStorageService.getByUrl(issueUrl),
            ]);

            if (!startTime || isNaN(new Date(startTime).getTime())) {
                console.error('Некорректное startTime:', startTime);
                this.resetButtonState(buttonElement);
                await StorageService.removeMultiple([
                    STORAGE_KEYS.ACTIVE_ISSUE,
                    STORAGE_KEYS.START_TIME,
                ]);
                return { issueUrl, totalTime: 0, isRunning: false };
            }

            const taskTitle = existingIssue?.title || 'Untitled';
            const timeSpentSeconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);

            const issueInfo = GitHubService.parseIssueUrl(issueUrl);
            const { owner, repo, issueNumber } = issueInfo;

            if (githubToken) {
                try {
                    await GitHubService.postComment({ owner, repo, issueNumber, seconds: timeSpentSeconds });
                } catch (error) {
                    console.error('Не удалось отправить комментарий:', error);
                }
            }

            const updatedTrackedTimes = [...(trackedTimes || []), {
                issueUrl,
                title: taskTitle,
                seconds: timeSpentSeconds,
                date: new Date().toISOString().slice(0, 10),
            }];

            await Promise.all([
                StorageService.set(STORAGE_KEYS.TRACKED_TIMES, updatedTrackedTimes),
                StorageService.removeMultiple([
                    STORAGE_KEYS.ACTIVE_ISSUE,
                    STORAGE_KEYS.START_TIME,
                ]),
            ]);

            const totalTime = await this.getTotalTimeForIssue(issueUrl);
            this.resetButtonState(buttonElement, totalTime);

            return { issueUrl, totalTime, isRunning: false };
        } catch (error) {
            console.error('Не удалось остановить таймер:', error);
            this.resetButtonState(buttonElement);
            return { issueUrl, totalTime: 0, isRunning: false };
        }
    }

    /**
     * Gets the issue title from the current page.
     * @returns {string | null} The issue title or null if not found.
     */
    static getIssueTitle() {
        return (
            document.querySelector('span.js-issue-title')?.textContent?.trim() ||
            document.querySelector("[data-testid='issue-title']")?.textContent?.trim()
        ) || null;
    }

    /**
     * Resets the timer button's state.
     * @param {HTMLButtonElement | null} buttonElement - The button element to reset.
     * @param {number} totalTime - The total time to display on the button.
     */
    static resetButtonState(buttonElement, totalTime = 0) {
        if (buttonElement?.dataset.intervalId) {
            clearInterval(parseInt(buttonElement.dataset.intervalId, 10));
            delete buttonElement.dataset.intervalId;
        }
        if (buttonElement) {
            buttonElement.textContent = `${TimeService.formatTime(0, totalTime)} Start Timer`;
        }
    }
}

