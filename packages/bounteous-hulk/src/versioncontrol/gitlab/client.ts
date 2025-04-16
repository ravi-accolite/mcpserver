import fetch, { RequestInit, Response } from 'node-fetch';
import { z } from 'zod';
import { VersionControlClient } from './common/interfaces.js';
import { FileOperation, Repository, Branch, Issue, MergeRequest } from './common/types.js';

const GITLAB_API_URL = process.env.GITLAB_API_URL || 'https://gitlab.com/api/v4';
const GITLAB_PERSONAL_ACCESS_TOKEN = process.env.GITLAB_PERSONAL_ACCESS_TOKEN;

if (!GITLAB_PERSONAL_ACCESS_TOKEN) {
  throw new Error('GITLAB_PERSONAL_ACCESS_TOKEN environment variable is not set');
}

export class GitLabClient implements VersionControlClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${GITLAB_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${GITLAB_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async searchRepositories(query: string, page = 1, perPage = 20): Promise<Repository[]> {
    const projects = await this.request<any[]>(`/projects?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
    return projects.map(project => ({
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      visibility: project.visibility,
      default_branch: project.default_branch,
      url: project.web_url,
    }));
  }

  async createRepository(options: Partial<Repository>): Promise<Repository> {
    const project = await this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        description: options.description,
        visibility: options.visibility,
        initialize_with_readme: true,
      }),
    });

    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      visibility: project.visibility,
      default_branch: project.default_branch,
      url: project.web_url,
    };
  }

  async forkRepository(projectId: string, namespace?: string): Promise<Repository> {
    const project = await this.request<any>(`/projects/${encodeURIComponent(projectId)}/fork${namespace ? `?namespace=${encodeURIComponent(namespace)}` : ''}`, {
      method: 'POST',
    });

    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      visibility: project.visibility,
      default_branch: project.default_branch,
      url: project.web_url,
    };
  }

  async getFileContents(projectId: string, filePath: string, ref?: string): Promise<string> {
    const file = await this.request<any>(`/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}?ref=${ref || 'main'}`);
    return Buffer.from(file.content, 'base64').toString('utf-8');
  }

  async createOrUpdateFile(
    projectId: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch: string,
    previousPath?: string
  ): Promise<void> {
    await this.request(`/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}`, {
      method: 'PUT',
      body: JSON.stringify({
        branch,
        content: Buffer.from(content).toString('base64'),
        commit_message: commitMessage,
        ...(previousPath ? { previous_path: previousPath } : {}),
      }),
    });
  }

  async pushFiles(
    projectId: string,
    commitMessage: string,
    branch: string,
    files: FileOperation[]
  ): Promise<void> {
    await this.request(`/projects/${encodeURIComponent(projectId)}/repository/commits`, {
      method: 'POST',
      body: JSON.stringify({
        branch,
        commit_message: commitMessage,
        actions: files.map(file => ({
          action: 'create',
          file_path: file.path,
          content: Buffer.from(file.content).toString('base64'),
        })),
      }),
    });
  }

  async createBranch(projectId: string, options: Branch): Promise<void> {
    await this.request(`/projects/${encodeURIComponent(projectId)}/repository/branches`, {
      method: 'POST',
      body: JSON.stringify({
        branch: options.name,
        ref: options.ref || 'main',
      }),
    });
  }

  async getDefaultBranchRef(projectId: string): Promise<string> {
    const project = await this.request<any>(`/projects/${encodeURIComponent(projectId)}`);
    return project.default_branch;
  }

  async createIssue(projectId: string, options: Issue): Promise<void> {
    await this.request(`/projects/${encodeURIComponent(projectId)}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title: options.title,
        description: options.description,
        labels: options.labels?.join(','),
        assignee_ids: options.assignees,
      }),
    });
  }

  async createMergeRequest(projectId: string, options: MergeRequest): Promise<void> {
    await this.request(`/projects/${encodeURIComponent(projectId)}/merge_requests`, {
      method: 'POST',
      body: JSON.stringify({
        title: options.title,
        description: options.description,
        source_branch: options.source_branch,
        target_branch: options.target_branch,
        labels: options.labels?.join(','),
        assignee_ids: options.assignees,
      }),
    });
  }
} 