// services/github/GithubClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { apiUrl } from "./githubConstants";
import { IHttpClient } from "./interfaces";

export class GithubClient implements IHttpClient {
  #client: AxiosInstance;

  constructor(apiKey: string) {
    this.#client = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
    });
  }

  async post<T>(endpoint: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.#client.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      throw this.#handleError(error);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.#client.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.#handleError(error);
    }
  }

  #handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return new Error(`API error: ${error.response.status} - ${error.response.data?.message || "Unknown error"}`);
      }
      if (error.request) {
        return new Error("No response received from API");
      }
      return new Error(`Request error: ${error.message}`);
    }
    return new Error("Unknown error");
  }
}