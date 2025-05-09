import { STORAGE_KEYS } from './constants';
import { StorageService } from './storage';

export class GitHubStorageService {
    static async getGitHubToken() {
        return StorageService.get(STORAGE_KEYS.GITHUB_TOKEN);
    }

    static async setGitHubToken(token) {
        return StorageService.set(STORAGE_KEYS.GITHUB_TOKEN, token);
    }

    static async removeGitHubToken() {
        return StorageService.remove(STORAGE_KEYS.GITHUB_TOKEN);
    }

    static async validateGitHubToken(token) {
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
}