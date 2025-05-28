// services/github/githubConstants.ts
export const apiUrl = "https://api.github.com";

export const endpoints = {
  issue: {
    comments: (owner: string, repo: string, issueNumber: string) =>
      `repos/${owner}/${repo}/issues/${issueNumber}/comments`,
  },
  user: {
    profile: "user",
  },
};