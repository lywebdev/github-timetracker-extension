import { githubClient } from "./githubClientInstance";
import { endpoints } from "./githubConstants";
import {CreatedIssueCommentResponse} from "../../types/github/issues/CreatedIssueCommentResponse";

class ApiGithubCommentService {
  async sendComment({ owner, repo, issueNumber, comment }: {
    owner: string;
    repo: string;
    issueNumber: string;
    comment: string;
  }): Promise<CreatedIssueCommentResponse> {
    return githubClient.post(endpoints.issue.comments(owner, repo, issueNumber), {
      body: comment,
    });
  }
}


export const apiGithubCommentService = new ApiGithubCommentService();