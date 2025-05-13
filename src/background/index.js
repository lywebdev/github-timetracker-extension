// background/index.js
import { StorageService } from '../utils/storage.js';
import { GitHubService } from '../utils/github.js';
import { GitHubStorageService } from '../utils/github-storage.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import {IssueStorageService} from "../utils/issue-storage.js";

async function handleTimerStop(reason) {
    const { activeIssue, startTime, trackedTimes } = await StorageService.getMultiple([
        STORAGE_KEYS.ACTIVE_ISSUE,
        STORAGE_KEYS.START_TIME,
        STORAGE_KEYS.TRACKED_TIMES,
    ]);

    if (activeIssue && startTime) {
        const timeSpent = (Date.now() - new Date(startTime).getTime()) / 1000;
        const issue = await IssueStorageService.getByUrl(activeIssue);
        console.log(`Stopped due to ${reason}. Tracked ${timeSpent} seconds on ${activeIssue}`);

        let issueInfo;
        try {
            issueInfo = GitHubService.parseIssueUrl(activeIssue);
        } catch (error) {
            console.error('Failed to parse issue URL:', error);
            return;
        }

        const { owner, repo, issueNumber } = issueInfo;
        const taskTitle = issue?.title || 'Untitled';

        const tracked = trackedTimes || [];
        tracked.push({
            issueUrl: activeIssue,
            title: taskTitle,
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

// Пересылка сообщений timerStarted/timerStopped ко всем вкладкам GitHub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    if (message.action === 'timerStarted' || message.action === 'timerStopped') {
        // Рассылаем сообщение всем вкладкам GitHub
        chrome.tabs.query({ url: '*://github.com/*' }, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log(`Failed to send message to tab ${tab.id}:`, chrome.runtime.lastError.message);
                    } else {
                        console.log(`Message sent to tab ${tab.id}, response:`, response);
                    }
                });
            });
        });
        sendResponse({ received: true });
    }
});