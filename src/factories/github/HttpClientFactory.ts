// factories//github/HttpClientFactory.ts
import {IHttpClient, IHttpClientFactory} from "../../services/github/interfaces";
import {GithubClient} from "../../services/github/GithubClient";

export class HttpClientFactory implements IHttpClientFactory {
  create(token: string): IHttpClient {
    return new GithubClient(token);
  }
}
