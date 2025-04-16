import { z } from 'zod';

export const FileOperationSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const RepositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  visibility: z.enum(['private', 'public', 'internal']).optional(),
  default_branch: z.string().optional(),
  url: z.string().optional(),
});

export const BranchSchema = z.object({
  name: z.string(),
  ref: z.string().optional(),
});

export const IssueSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export const MergeRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  source_branch: z.string(),
  target_branch: z.string(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export type FileOperation = z.infer<typeof FileOperationSchema>;
export type Repository = z.infer<typeof RepositorySchema>;
export type Branch = z.infer<typeof BranchSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type MergeRequest = z.infer<typeof MergeRequestSchema>; 