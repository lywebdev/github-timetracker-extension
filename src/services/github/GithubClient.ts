import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import { apiUrl } from "./githubConstants";

export class GithubClient {
  #client: AxiosInstance;

  constructor(apiKey: string) {
    this.#client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `token ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      }
    });
  }

  async post<T = unknown>(endpoint: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T | undefined> {
    try {
      const response: AxiosResponse<T> = await this.#client.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      throw this.#handleError(error);
    }
  }

  async get<T>(endpoint: string): Promise<T | undefined> {
    try {
      const response: AxiosResponse = await this.#client.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.#handleError(error);
    }
  }



  #handleError(error: unknown): undefined {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data?.message}`);
      } else if (error.request) {
        throw new Error('No response received from API');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }

    throw new Error('Unknown error');
  }
}