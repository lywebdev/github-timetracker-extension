// services/github/UserService.ts
import { endpoints } from "./githubConstants";
import { IHttpClient, IUserService } from "./interfaces";
import { User } from "../../types/github/users/User";

export class UserService implements IUserService {
  constructor(private readonly client: IHttpClient) {}

  async getUser(): Promise<User> {
    const user = await this.client.get<User>(endpoints.user.profile);
    if (!user) {
      throw new Error("Не удалось получить данные пользователя");
    }
    return user;
  }
}