import { StorageService } from "../../utils/storage.js";
import { STORAGE_KEYS } from "../../utils/constants.js";

class GitHubStorageService {
  async getGitHubToken() {
    return StorageService.get(STORAGE_KEYS.GITHUB_TOKEN);
  }

  async setGitHubToken(token) {
    return StorageService.set(STORAGE_KEYS.GITHUB_TOKEN, token);
  }

  async removeGitHubToken() {
    return StorageService.remove(STORAGE_KEYS.GITHUB_TOKEN);
  }

  async validateGitHubToken(token) {
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

export default new GitHubStorageService();