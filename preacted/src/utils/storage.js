// Получение токена
export async function getGitHubToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get("githubToken", (data) => {
            resolve(data.githubToken || null);
        });
    });
}

// Сохранение токена
export async function setGitHubToken(token) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ githubToken: token }, () => {
            resolve();
        });
    });
}

// Удаление токена
export async function removeGitHubToken() {
    return new Promise((resolve) => {
        chrome.storage.local.remove("githubToken", () => {
            resolve();
        });
    });
}

// Валидация токена через GitHub API
export async function validateGitHubToken(token) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` }
        });
        return response.ok;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
}