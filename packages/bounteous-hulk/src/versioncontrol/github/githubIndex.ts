import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import * as repository from './operations/repository.js';
import * as files from './operations/files.js';
import * as issues from './operations/issues.js';
import * as pulls from './operations/pulls.js';
import * as branches from './operations/branches.js';
import * as search from './operations/search.js';
import * as commits from './operations/commits.js';
import {
  GitHubError,
  GitHubValidationError,
  GitHubResourceNotFoundError,
  GitHubAuthenticationError,
  GitHubPermissionError,
  GitHubRateLimitError,
  GitHubConflictError,
  isGitHubError,
} from './common/errors.js';
import { VERSION } from "./common/version.js";

function formatGitHubError(error: GitHubError): string {
  let message = `GitHub API Error: ${error.message}`;
  
  if (error instanceof GitHubValidationError) {
    message = `Validation Error: ${error.message}`;
    if (error.response) {
      message += `\nDetails: ${JSON.stringify(error.response)}`;
    }
  } else if (error instanceof GitHubResourceNotFoundError) {
    message = `Not Found: ${error.message}`;
  } else if (error instanceof GitHubAuthenticationError) {
    message = `Authentication Failed: ${error.message}`;
  } else if (error instanceof GitHubPermissionError) {
    message = `Permission Denied: ${error.message}`;
  } else if (error instanceof GitHubRateLimitError) {
    message = `Rate Limit Exceeded: ${error.message}\nResets at: ${error.resetAt.toISOString()}`;
  } else if (error instanceof GitHubConflictError) {
    message = `Conflict: ${error.message}`;
  }

  return message;
}

export const githubTools = [
  {
    name: "create_or_update_file",
    description: "Create or update a single file in a GitHub repository",
    inputSchema: zodToJsonSchema(files.CreateOrUpdateFileSchema),
  },
  {
    name: "search_repositories",
    description: "Search for GitHub repositories",
    inputSchema: zodToJsonSchema(repository.SearchRepositoriesSchema),
  },
  {
    name: "create_repository",
    description: "Create a new GitHub repository in your account",
    inputSchema: zodToJsonSchema(repository.CreateRepositoryOptionsSchema),
  },
  {
    name: "get_file_contents",
    description: "Get the contents of a file or directory from a GitHub repository",
    inputSchema: zodToJsonSchema(files.GetFileContentsSchema),
  },
  {
    name: "push_files",
    description: "Push multiple files to a GitHub repository in a single commit",
    inputSchema: zodToJsonSchema(files.PushFilesSchema),
  },
  {
    name: "create_issue",
    description: "Create a new issue in a GitHub repository",
    inputSchema: zodToJsonSchema(issues.CreateIssueSchema),
  },
  {
    name: "create_pull_request",
    description: "Create a new pull request in a GitHub repository",
    inputSchema: zodToJsonSchema(pulls.CreatePullRequestSchema),
  },
  {
    name: "fork_repository",
    description: "Fork a GitHub repository to your account or specified organization",
    inputSchema: zodToJsonSchema(repository.ForkRepositorySchema),
  },
  {
    name: "create_branch",
    description: "Create a new branch in a GitHub repository",
    inputSchema: zodToJsonSchema(branches.CreateBranchSchema),
  },
  {
    name: "list_commits",
    description: "Get list of commits of a branch in a GitHub repository",
    inputSchema: zodToJsonSchema(commits.ListCommitsSchema)
  },
  {
    name: "list_issues",
    description: "List issues in a GitHub repository with filtering options",
    inputSchema: zodToJsonSchema(issues.ListIssuesOptionsSchema)
  },
  {
    name: "update_issue",
    description: "Update an existing issue in a GitHub repository",
    inputSchema: zodToJsonSchema(issues.UpdateIssueOptionsSchema)
  },
  {
    name: "add_issue_comment",
    description: "Add a comment to an existing issue",
    inputSchema: zodToJsonSchema(issues.IssueCommentSchema)
  },
  {
    name: "search_code",
    description: "Search for code across GitHub repositories",
    inputSchema: zodToJsonSchema(search.SearchCodeSchema),
  },
  {
    name: "search_issues",
    description: "Search for issues and pull requests across GitHub repositories",
    inputSchema: zodToJsonSchema(search.SearchIssuesSchema),
  },
  {
    name: "search_users",
    description: "Search for users on GitHub",
    inputSchema: zodToJsonSchema(search.SearchUsersSchema),
  },
  {
    name: "get_issue",
    description: "Get details of a specific issue in a GitHub repository.",
    inputSchema: zodToJsonSchema(issues.GetIssueSchema)
  },
  {
    name: "get_pull_request",
    description: "Get details of a specific pull request",
    inputSchema: zodToJsonSchema(pulls.GetPullRequestSchema)
  },
  {
    name: "list_pull_requests",
    description: "List and filter repository pull requests",
    inputSchema: zodToJsonSchema(pulls.ListPullRequestsSchema)
  },
  {
    name: "create_pull_request_review",
    description: "Create a review on a pull request",
    inputSchema: zodToJsonSchema(pulls.CreatePullRequestReviewSchema)
  },
  {
    name: "merge_pull_request",
    description: "Merge a pull request",
    inputSchema: zodToJsonSchema(pulls.MergePullRequestSchema)
  },
  {
    name: "get_pull_request_files",
    description: "Get the list of files changed in a pull request",
    inputSchema: zodToJsonSchema(pulls.GetPullRequestFilesSchema)
  },
  {
    name: "get_pull_request_status",
    description: "Get the combined status of all status checks for a pull request",
    inputSchema: zodToJsonSchema(pulls.GetPullRequestStatusSchema)
  },
  {
    name: "update_pull_request_branch",
    description: "Update a pull request branch with the latest changes from the base branch",
    inputSchema: zodToJsonSchema(pulls.UpdatePullRequestBranchSchema)
  },
  {
    name: "get_pull_request_comments",
    description: "Get the review comments on a pull request",
    inputSchema: zodToJsonSchema(pulls.GetPullRequestCommentsSchema)
  },
  {
    name: "get_pull_request_reviews",
    description: "Get the reviews on a pull request",
    inputSchema: zodToJsonSchema(pulls.GetPullRequestReviewsSchema)
  }
];

export async function handleGitHubRequest(toolName: string, args: any) {
  try {
    switch (toolName) {
      case "fork_repository": {
        const parsedArgs = repository.ForkRepositorySchema.parse(args);
        const fork = await repository.forkRepository(parsedArgs.owner, parsedArgs.repo, parsedArgs.organization);
        return {
          content: [{ type: "text", text: JSON.stringify(fork, null, 2) }],
        };
      }

      case "create_branch": {
        const parsedArgs = branches.CreateBranchSchema.parse(args);
        const branch = await branches.createBranchFromRef(
          parsedArgs.owner,
          parsedArgs.repo,
          parsedArgs.branch,
          parsedArgs.from_branch
        );
        return {
          content: [{ type: "text", text: JSON.stringify(branch, null, 2) }],
        };
      }

      case "search_repositories": {
        const parsedArgs = repository.SearchRepositoriesSchema.parse(args);
        const results = await repository.searchRepositories(
          parsedArgs.query,
          parsedArgs.page,
          parsedArgs.perPage
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "create_repository": {
        const parsedArgs = repository.CreateRepositoryOptionsSchema.parse(args);
        const result = await repository.createRepository(parsedArgs);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_file_contents": {
        const parsedArgs = files.GetFileContentsSchema.parse(args);
        const contents = await files.getFileContents(
          parsedArgs.owner,
          parsedArgs.repo,
          parsedArgs.path,
          parsedArgs.branch
        );
        return {
          content: [{ type: "text", text: JSON.stringify(contents, null, 2) }],
        };
      }

      case "create_or_update_file": {
        const parsedArgs = files.CreateOrUpdateFileSchema.parse(args);
        const result = await files.createOrUpdateFile(
          parsedArgs.owner,
          parsedArgs.repo,
          parsedArgs.path,
          parsedArgs.content,
          parsedArgs.message,
          parsedArgs.branch,
          parsedArgs.sha
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "push_files": {
        const parsedArgs = files.PushFilesSchema.parse(args);
        const result = await files.pushFiles(
          parsedArgs.owner,
          parsedArgs.repo,
          parsedArgs.branch,
          parsedArgs.files,
          parsedArgs.message
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "create_issue": {
        const parsedArgs = issues.CreateIssueSchema.parse(args);
        const { owner, repo, ...options } = parsedArgs;
        
        try {
          console.error(`[DEBUG] Attempting to create issue in ${owner}/${repo}`);
          console.error(`[DEBUG] Issue options:`, JSON.stringify(options, null, 2));
          
          const issue = await issues.createIssue(owner, repo, options);
          
          console.error(`[DEBUG] Issue created successfully`);
          return {
            content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
          };
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          
          console.error(`[ERROR] Failed to create issue:`, error);
          
          if (error instanceof GitHubResourceNotFoundError) {
            throw new Error(
              `Repository '${owner}/${repo}' not found. Please verify:\n` +
              `1. The repository exists\n` +
              `2. You have correct access permissions\n` +
              `3. The owner and repository names are spelled correctly`
            );
          }
          
          throw new Error(
            `Failed to create issue: ${error.message}${
              error.stack ? `\nStack: ${error.stack}` : ''
            }`
          );
        }
      }

      case "create_pull_request": {
        const parsedArgs = pulls.CreatePullRequestSchema.parse(args);
        const pullRequest = await pulls.createPullRequest(parsedArgs);
        return {
          content: [{ type: "text", text: JSON.stringify(pullRequest, null, 2) }],
        };
      }

      case "search_code": {
        const parsedArgs = search.SearchCodeSchema.parse(args);
        const results = await search.searchCode(parsedArgs);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "search_issues": {
        const parsedArgs = search.SearchIssuesSchema.parse(args);
        const results = await search.searchIssues(parsedArgs);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "search_users": {
        const parsedArgs = search.SearchUsersSchema.parse(args);
        const results = await search.searchUsers(parsedArgs);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "list_issues": {
        const parsedArgs = issues.ListIssuesOptionsSchema.parse(args);
        const { owner, repo, ...options } = parsedArgs;
        const result = await issues.listIssues(owner, repo, options);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_issue": {
        const parsedArgs = issues.UpdateIssueOptionsSchema.parse(args);
        const { owner, repo, issue_number, ...options } = parsedArgs;
        const result = await issues.updateIssue(owner, repo, issue_number, options);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_issue_comment": {
        const parsedArgs = issues.IssueCommentSchema.parse(args);
        const { owner, repo, issue_number, body } = parsedArgs;
        const result = await issues.addIssueComment(owner, repo, issue_number, body);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_commits": {
        const parsedArgs = commits.ListCommitsSchema.parse(args);
        const results = await commits.listCommits(
          parsedArgs.owner,
          parsedArgs.repo,
          parsedArgs.page,
          parsedArgs.perPage,
          parsedArgs.sha
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "get_issue": {
        const parsedArgs = issues.GetIssueSchema.parse(args);
        const issue = await issues.getIssue(parsedArgs.owner, parsedArgs.repo, parsedArgs.issue_number);
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
        };
      }

      case "get_pull_request": {
        const parsedArgs = pulls.GetPullRequestSchema.parse(args);
        const pullRequest = await pulls.getPullRequest(parsedArgs.owner, parsedArgs.repo, parsedArgs.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(pullRequest, null, 2) }],
        };
      }

      case "list_pull_requests": {
        const parsedArgs = pulls.ListPullRequestsSchema.parse(args);
        const { owner, repo, ...options } = parsedArgs;
        const pullRequests = await pulls.listPullRequests(owner, repo, options);
        return {
          content: [{ type: "text", text: JSON.stringify(pullRequests, null, 2) }],
        };
      }

      case "create_pull_request_review": {
        const parsedArgs = pulls.CreatePullRequestReviewSchema.parse(args);
        const { owner, repo, pull_number, ...options } = parsedArgs;
        const review = await pulls.createPullRequestReview(owner, repo, pull_number, options);
        return {
          content: [{ type: "text", text: JSON.stringify(review, null, 2) }],
        };
      }

      case "merge_pull_request": {
        const parsedArgs = pulls.MergePullRequestSchema.parse(args);
        const { owner, repo, pull_number, ...options } = parsedArgs;
        const result = await pulls.mergePullRequest(owner, repo, pull_number, options);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_pull_request_files": {
        const parsedArgs = pulls.GetPullRequestFilesSchema.parse(args);
        const files = await pulls.getPullRequestFiles(parsedArgs.owner, parsedArgs.repo, parsedArgs.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(files, null, 2) }],
        };
      }

      case "get_pull_request_status": {
        const parsedArgs = pulls.GetPullRequestStatusSchema.parse(args);
        const status = await pulls.getPullRequestStatus(parsedArgs.owner, parsedArgs.repo, parsedArgs.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
        };
      }

      case "update_pull_request_branch": {
        const parsedArgs = pulls.UpdatePullRequestBranchSchema.parse(args);
        const { owner, repo, pull_number, expected_head_sha } = parsedArgs;
        await pulls.updatePullRequestBranch(owner, repo, pull_number, expected_head_sha);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }, null, 2) }],
        };
      }

      case "get_pull_request_comments": {
        const parsedArgs = pulls.GetPullRequestCommentsSchema.parse(args);
        const comments = await pulls.getPullRequestComments(parsedArgs.owner, parsedArgs.repo, parsedArgs.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
        };
      }

      case "get_pull_request_reviews": {
        const parsedArgs = pulls.GetPullRequestReviewsSchema.parse(args);
        const reviews = await pulls.getPullRequestReviews(parsedArgs.owner, parsedArgs.repo, parsedArgs.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(reviews, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    if (isGitHubError(error)) {
      throw new Error(formatGitHubError(error));
    }
    throw error;
  }
}

export { VERSION }; 