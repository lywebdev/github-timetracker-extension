export const GITHUB_API_URL = 'https://api.github.com';
export const STORAGE_KEYS = {
    GITHUB_TOKEN: 'githubToken',
    ACTIVE_ISSUE: 'activeIssue',
    START_TIME: 'startTime',
    TRACKED_TIMES: 'trackedTimes',
    ISSUES: 'issues',
};
export const TIME_UPDATE_INTERVAL = 1000;
export const COMMENT_TEMPLATE = (timeString) => `⏱️ Tracked time: **${timeString}**`;