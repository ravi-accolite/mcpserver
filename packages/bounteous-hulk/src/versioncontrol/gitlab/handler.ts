import { z } from 'zod';
import { GitLabClient } from './client.js';
import { handleError, createResponse } from './common/utils.js';
import {
  SearchRepositoriesSchema,
  CreateRepositorySchema,
  ForkRepositorySchema,
  GetFileContentsSchema,
  CreateOrUpdateFileSchema,
  PushFilesSchema,
  CreateBranchSchema,
  CreateIssueSchema,
  CreateMergeRequestSchema,
} from './tools.js';

const client = new GitLabClient();

export async function handleGitLabRequest(toolName: string, args: any) {
  try {
    if (!args) {
      throw new Error("Arguments are required");
    }

    switch (toolName) {
      case "search_repositories": {
        const parsedArgs = SearchRepositoriesSchema.parse(args);
        const results = await client.searchRepositories(
          parsedArgs.search,
          parsedArgs.page,
          parsedArgs.per_page
        );
        return createResponse(results);
      }

      case "create_repository": {
        const parsedArgs = CreateRepositorySchema.parse(args);
        const repository = await client.createRepository(parsedArgs);
        return createResponse(repository);
      }

      case "fork_repository": {
        const parsedArgs = ForkRepositorySchema.parse(args);
        const fork = await client.forkRepository(parsedArgs.project_id, parsedArgs.namespace);
        return createResponse(fork);
      }

      case "get_file_contents": {
        const parsedArgs = GetFileContentsSchema.parse(args);
        const contents = await client.getFileContents(
          parsedArgs.project_id,
          parsedArgs.file_path,
          parsedArgs.ref
        );
        return createResponse(contents);
      }

      case "create_or_update_file": {
        const parsedArgs = CreateOrUpdateFileSchema.parse(args);
        await client.createOrUpdateFile(
          parsedArgs.project_id,
          parsedArgs.file_path,
          parsedArgs.content,
          parsedArgs.commit_message,
          parsedArgs.branch,
          parsedArgs.previous_path
        );
        return createResponse({ success: true });
      }

      case "push_files": {
        const parsedArgs = PushFilesSchema.parse(args);
        await client.pushFiles(
          parsedArgs.project_id,
          parsedArgs.commit_message,
          parsedArgs.branch,
          parsedArgs.files
        );
        return createResponse({ success: true });
      }

      case "create_branch": {
        const parsedArgs = CreateBranchSchema.parse(args);
        let ref = parsedArgs.ref;
        if (!ref) {
          ref = await client.getDefaultBranchRef(parsedArgs.project_id);
        }

        await client.createBranch(parsedArgs.project_id, {
          name: parsedArgs.branch,
          ref
        });
        return createResponse({ success: true });
      }

      case "create_issue": {
        const parsedArgs = CreateIssueSchema.parse(args);
        const { project_id, ...options } = parsedArgs;
        await client.createIssue(project_id, options);
        return createResponse({ success: true });
      }

      case "create_merge_request": {
        const parsedArgs = CreateMergeRequestSchema.parse(args);
        const { project_id, ...options } = parsedArgs;
        await client.createMergeRequest(project_id, options);
        return createResponse({ success: true });
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    handleError(error);
  }
} 