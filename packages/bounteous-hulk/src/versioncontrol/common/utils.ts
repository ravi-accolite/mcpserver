import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function createToolSchema(name: string, description: string, schema: z.ZodType<any>) {
  return {
    name,
    description,
    inputSchema: zodToJsonSchema(schema),
  };
}

export function handleError(error: unknown): never {
  if (error instanceof z.ZodError) {
    throw new Error(`Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
  }
  throw error;
}

export function createResponse(content: any) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(content, null, 2)
    }]
  };
} 