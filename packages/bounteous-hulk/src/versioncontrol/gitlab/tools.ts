import { z } from 'zod';
import { createToolSchema } from '../common/utils.js';
import { RepositorySchema, BranchSchema, IssueSchema, MergeRequestSchema, FileOperationSchema } from '../common/types.js';

export const SearchRepositoriesSchema = z.object({
  search: z.string(),
  page: z.number().optional(),
  per_page: z.number().optional(),
});

export const CreateRepositorySchema = RepositorySchema.partial();

export const ForkRepositorySchema = z.object({
  project_id: z.string(),
  namespace: z.string().optional(),
});

export const GetFileContentsSchema = z.object({
  project_id: z.string(),
  file_path: z.string(),
  ref: z.string().optional(),
});

export const CreateOrUpdateFileSchema = z.object({
  project_id: z.string(),
  file_path: z.string(),
  content: z.string(),
  commit_message: z.string(),
  branch: z.string(),
  previous_path: z.string().optional(),
});

export const PushFilesSchema = z.object({
  project_id: z.string(),
  commit_message: z.string(),
  branch: z.string(),
  files: z.array(FileOperationSchema),
});

export const CreateBranchSchema = z.object({
  project_id: z.string(),
  branch: z.string(),
  ref: z.string().optional(),
});

export const CreateIssueSchema = z.object({
  project_id: z.string(),
  ...IssueSchema.shape,
});

export const CreateMergeRequestSchema = z.object({
  project_id: z.string(),
  ...MergeRequestSchema.shape,
});

export const gitlabTools = [
  createToolSchema(
    'search_repositories',
    'Search for GitLab repositories',
    SearchRepositoriesSchema
  ),
  createToolSchema(
    'create_repository',
    'Create a new GitLab repository',
    CreateRepositorySchema
  ),
  createToolSchema(
    'fork_repository',
    'Fork a GitLab repository',
    ForkRepositorySchema
  ),
  createToolSchema(
    'get_file_contents',
    'Get file contents from a GitLab repository',
    GetFileContentsSchema
  ),
  createToolSchema(
    'create_or_update_file',
    'Create or update a file in a GitLab repository',
    CreateOrUpdateFileSchema
  ),
  createToolSchema(
    'push_files',
    'Push multiple files to a GitLab repository',
    PushFilesSchema
  ),
  createToolSchema(
    'create_branch',
    'Create a new branch in a GitLab repository',
    CreateBranchSchema
  ),
  createToolSchema(
    'create_issue',
    'Create a new issue in a GitLab repository',
    CreateIssueSchema
  ),
  createToolSchema(
    'create_merge_request',
    'Create a new merge request in a GitLab repository',
    CreateMergeRequestSchema
  ),
]; 