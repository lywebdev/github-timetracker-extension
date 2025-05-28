// services/github/GithubStorageService.ts
import { STORAGE_KEYS } from "../../utils/constants.js";
import { IStorageService, IGitHubStorageService, IUserService } from "./interfaces";

export class GitHubStorageService implements IGitHubStorageService {
  constructor(private readonly storageService: IStorageService) {}

  async getGitHubToken(): Promise<string | null> {
    const token = await this.storageService.get<string>(STORAGE_KEYS.GITHUB_TOKEN);
    if (typeof token !== "string") {
      console.warn(`Invalid GitHub token type: expected string, got ${typeof token}`);
      return null;
    }
    return token;
  }

  async setGitHubToken(token: string): Promise<void> {
    await this.storageService.set(STORAGE_KEYS.GITHUB_TOKEN, token);
  }

  async removeGitHubToken(): Promise<void> {
    await this.storageService.remove(STORAGE_KEYS.GITHUB_TOKEN);
  }

  async validateGitHubToken(token: string, userService: IUserService): Promise<boolean> {
    try {
      const user = await userService.getUser();
      return !!user;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }
}