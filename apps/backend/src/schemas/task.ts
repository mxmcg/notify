import { z } from "zod";

// Task schemas matching frontend interface
export const TaskCreate = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  scheduledTime: z.string().transform(str => new Date(str)),
  repeatType: z.enum(["none", "daily", "weekly", "monthly"]),
  isEnabled: z.boolean().default(true),
  notificationId: z.string().optional(),
});

export const TaskUpdate = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  scheduledTime: z.string().transform(str => new Date(str)).optional(),
  repeatType: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  isEnabled: z.boolean().optional(),
  notificationId: z.string().optional(),
});

// LLM Processing schemas
export const LLMProcessRequest = z.object({
  taskId: z.string().uuid(),
  customPrompt: z.string().optional(), // Optional custom prompt override
  model: z.enum(["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"]).default("gpt-3.5-turbo"),
});

export const LLMResponse = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  prompt: z.string(),
  response: z.string(),
  model: z.string(),
  tokens: z.number().nullable(),
  cost: z.number().nullable(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  error: z.string().nullable(),
  createdAt: z.date(),
});

// API Response types
export type TaskCreateInput = z.infer<typeof TaskCreate>;
export type TaskUpdateInput = z.infer<typeof TaskUpdate>;
export type LLMProcessRequestInput = z.infer<typeof LLMProcessRequest>;
export type LLMResponseType = z.infer<typeof LLMResponse>;
