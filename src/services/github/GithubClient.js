import axios from "axios";
import { apiUrl } from "./githubConstants.js";

export default class GithubClient {
  // #apiKey;
  #client;

  constructor(apiKey) {
    // this.#apiKey = apiKey;
    this.#client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer: ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async post(endpoint, data) {
    try {
      const response = await this.#client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.#handleError();
    }
  }



  #handleError(error) {
    if (error.response) {
      throw new Error(`API error: ${error.response.status} - ${error.response.data.message}`);
    } else if (error.request) {
      throw new Error('No response received from API');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
}