import { FileOperation, Repository, Branch, Issue, MergeRequest } from './types.js';

export interface VersionControlClient {
  // Repository operations
  searchRepositories(query: string, page?: number, perPage?: number): Promise<Repository[]>;
  createRepository(options: Partial<Repository>): Promise<Repository>;
  forkRepository(projectId: string, namespace?: string): Promise<Repository>;

  // File operations
  getFileContents(projectId: string, filePath: string, ref?: string): Promise<string>;
  createOrUpdateFile(
    projectId: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch: string,
    previousPath?: string
  ): Promise<void>;
  pushFiles(
    projectId: string,
    commitMessage: string,
    branch: string,
    files: FileOperation[]
  ): Promise<void>;

  // Branch operations
  createBranch(projectId: string, options: Branch): Promise<void>;
  getDefaultBranchRef(projectId: string): Promise<string>;

  // Issue operations
  createIssue(projectId: string, options: Issue): Promise<void>;

  // Merge request operations
  createMergeRequest(projectId: string, options: MergeRequest): Promise<void>;
} 