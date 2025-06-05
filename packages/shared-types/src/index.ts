// Shared types between frontend and backend

export interface Task {
  id: string;
  query: string;
  frequency: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  llmResponses?: LLMResponse[];
}

export interface LLMResponse {
  id: string;
  taskId: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number | null;
  cost: number | null;
  status: ResponseStatus;
  error: string | null;
  createdAt: Date;
  task?: Task;
}

export enum ResponseStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// API Request/Response types
export interface CreateTaskRequest {
  query: string;
  frequency: string;
  isEnabled?: boolean;
}

export interface UpdateTaskRequest {
  query?: string;
  frequency?: string;
  isEnabled?: boolean;
}

export interface ProcessTaskRequest {
  customPrompt?: string;
  model?: "gpt-4" | "gpt-3.5-turbo" | "gpt-4-turbo";
}

export interface ProcessTaskResponse {
  message: string;
  responseId: string;
  status: ResponseStatus;
}

export interface ProcessLLMRequest {
  prompt: string;
  model?: "gpt-4" | "gpt-3.5-turbo" | "gpt-4-turbo";
}

export interface ProcessLLMResponse {
  id: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number | null;
  cost: number | null;
  status: ResponseStatus;
}

// API Error Response
export interface APIError {
  error: string;
  details?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Frontend-specific types (matching mobile app)
export interface FrontendTask {
  id: string;
  query: string;
  frequency: string;
  createdAt: number; // Timestamp in milliseconds
}

// Utility type for API responses
export type APIResponse<T> = T | APIError;