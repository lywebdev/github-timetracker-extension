// services/github/entrypoint.ts
import { createGithubClient } from "./githubClientInstance";
import { CommentService } from "./CommentService";
import { UserService } from "./UserService";
import { GitHubStorageService } from "./GithubStorageService";
import { StorageService } from "../storage/StorageService";

const storageService = new StorageService();
const githubStorageService = new GitHubStorageService(storageService);

const githubClient = await createGithubClient(githubStorageService);



export const userService = new UserService(githubClient);
export const commentService = new CommentService(githubClient);


export { githubStorageService };