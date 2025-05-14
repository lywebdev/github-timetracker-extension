import GithubClient from "./GithubClient.js";
import { GitHubStorageService } from "../../utils/github-storage.js";

const token = GitHubStorageService.getGitHubToken();
export const githubClient = new GithubClient(token);