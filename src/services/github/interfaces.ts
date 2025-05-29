import { CreatedIssueCommentResponse } from "../../types/github/issues/CreatedIssueCommentResponse";
import { User } from "../../types/github/users/User";

export interface IHttpClient {
  post<T>(endpoint: string, data: unknown, options?: unknown): Promise<T>;
  get<T>(endpoint: string): Promise<T>;
}

export interface IHttpClientFactory {
  create(token: string): IHttpClient;
}

export interface ICommentService {
  sendComment(params: {
    owner: string;
    repo: string;
    issueNumber: string;
    comment: string;
  }): Promise<CreatedIssueCommentResponse>;
}

export interface IUserService {
  getUser(): Promise<User>;
}

/** todo send to storage */
export type StorageValue = string | number | boolean | object | null;

export interface IStorageService {
  get<T extends StorageValue>(key: string): Promise<T | null>;
  set<T extends StorageValue>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  getMultiple<T extends StorageValue>(keys: string[]): Promise<Record<string, T | null>>;
  removeMultiple(keys: string[]): Promise<void>;
}

export interface IGitHubStorageService {
  getGitHubToken(): Promise<string | null>;
  setGitHubToken(token: string): Promise<void>;
  removeGitHubToken(): Promise<void>;
  validateGitHubToken(token: string, userService: IUserService): Promise<boolean>;
}