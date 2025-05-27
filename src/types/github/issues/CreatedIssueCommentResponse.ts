import {User} from "../users/User";

export type CreatedIssueCommentResponse = {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string | null;
  user: User;
  created_at: string;
  updated_at: string;
  issue_url: string;
  author_association: string;
} | undefined;