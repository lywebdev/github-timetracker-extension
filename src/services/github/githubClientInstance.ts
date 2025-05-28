// services/github/githubClientInstance.ts
import { GithubClient } from "./GithubClient";
import { IGitHubStorageService } from "./interfaces";

export async function createGithubClient(storageService: IGitHubStorageService): Promise<GithubClient> {
  const token = await storageService.getGitHubToken();
  if (!token) {
    throw new Error("GitHub token is missing");
  }
  return new GithubClient(token);
}