// services/github/CommentService.ts
import {endpoints} from "./githubConstants";
import {IHttpClient} from "./interfaces";
import {ICommentService} from "./interfaces";
import {CreatedIssueCommentResponse} from "../../types/github/issues/CreatedIssueCommentResponse";

export class CommentService implements ICommentService {
  constructor(private readonly client: IHttpClient) {
  }

  async sendComment(
    {
      owner,
      repo,
      issueNumber,
      comment,
    }: {
      owner: string;
      repo: string;
      issueNumber: string;
      comment: string;
    }): Promise<CreatedIssueCommentResponse> {
    return this.client.post(endpoints.issue.comments(owner, repo, issueNumber), {
      body: comment,
    });
  }
}