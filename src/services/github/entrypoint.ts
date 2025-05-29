// services/github/entrypoint.ts
import { createGithubClient } from "./githubClientInstance";
import { CommentService } from "./CommentService";
import { UserService } from "./UserService";
import { GitHubStorageService } from "./GithubStorageService";
import { StorageService } from "../storage/StorageService";
import {HttpClientFactory} from "../../factories/github/HttpClientFactory";

const storageService = new StorageService();
const httpClientFactory = new HttpClientFactory();

const githubStorageService = new GitHubStorageService(storageService, httpClientFactory);

const githubClient = await createGithubClient(githubStorageService);


export const userService = new UserService(githubClient);
export const commentService = new CommentService(githubClient);


export { githubStorageService };