export const apiUrl = 'https://api.github.com';

export const endpoints = {
  issue: {
    comments: (owner, repo, issueNumber) => `repos/${owner}/${repo}/issues/${issueNumber}/comments`
  },
};