import { githubClient } from "./githubClientInstance.js";
import { endpoints } from "./githubConstants";
import {User} from "../../types/github/users/User";

class ApiGithubUserService {
  async getUser(): Promise<User> {
    const user = await githubClient.get<User>(endpoints.user.profile);
    if (!user) {
      throw new Error('Не удалось получить данные пользователя');
    }

    return user;
  }
}


export const apiGithubUserService = new ApiGithubUserService();