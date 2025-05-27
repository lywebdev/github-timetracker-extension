import {GithubClient} from "./GithubClient";
import {githubStorageService} from "./GithubStorageService";

const token = await githubStorageService.getGitHubToken();
if (!token) {
  throw new Error('GitHub token is missing');
}

export const githubClient = new GithubClient(token);