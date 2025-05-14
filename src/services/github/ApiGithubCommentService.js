import { githubClient } from "./githubClientInstance.js";
import { endpoints } from "./githubConstants.js";

class ApiGithubCommentService {
  async sendComment({ owner, repo, issueNumber, comment }) {
    if (!owner || !repo || !issueNumber || !comment) {
      throw new Error('Missing required parameters for posting a GitHub comment.');
    }

    return githubClient.post(endpoints.issue.comments(owner, repo, issueNumber), {
      body: comment,
    });
  }
}


export default new ApiGithubCommentService();