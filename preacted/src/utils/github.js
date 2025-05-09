import { getGitHubToken } from './storage';


/**
 * Парсит URL issue/PR GitHub
 * @param {string} url - GitHub URL (например: "/owner/repo/issues/123")
 * @returns {object} {owner, repo, issueNumber}
 * @throws {Error} Если URL невалидный
 */
export function parseIssueUrl(url) {
    const match = url.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
    if (!match) throw new Error("Invalid GitHub issue URL");

    return {
        owner: match[1],
        repo: match[2],
        issueNumber: parseInt(match[3]), // Преобразуем в число
        fullRepo: `${match[1]}/${match[2]}` // Добавляем удобное поле
    };
}

// Базовый запрос к GitHub API
async function githubApiRequest(endpoint, options = {}) {
    const token = await getGitHubToken();
    if (!token) throw new Error('GitHub token not found');

    const response = await fetch(`https://api.github.com${endpoint}`, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'GitHub API request failed');
    }

    return response.json();
}

// Получение информации о пользователе
export async function getGitHubUser() {
    return githubApiRequest('/user');
}

// Отправка комментария
export async function postComment(owner, repo, issueNumber, seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const timeString = minutes > 0
        ? `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds} sec` : ""}`
        : `${remainingSeconds} sec`;

    return githubApiRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            body: `⏱️ Tracked time: **${timeString}** via GitHub Time Tracker extension.`
        })
    });
}