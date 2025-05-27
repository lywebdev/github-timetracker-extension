import { STORAGE_KEYS } from "../../utils/constants.js";
import {storageService} from "../storage/StorageService";
import {apiGithubUserService} from "./ApiGithubUserService";

class GitHubStorageService {
  async getGitHubToken(): Promise<string | null> {
    const token = await storageService.get(STORAGE_KEYS.GITHUB_TOKEN);
    if (typeof token !== 'string' && token !== null) {
      console.warn(`Invalid GitHub token type: expected string, got ${typeof token}`);
      return null;
    }

    return token;
  }

  async setGitHubToken(token: string): Promise<void> {
    return storageService.set(STORAGE_KEYS.GITHUB_TOKEN, token);
  }

  async removeGitHubToken(): Promise<void> {
    return storageService.remove(STORAGE_KEYS.GITHUB_TOKEN);
  }

  async validateGitHubToken(token: string): Promise<boolean> {
    try {
      const response = await apiGithubUserService.getUser();
      return !!response;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

export const githubStorageService = new GitHubStorageService();