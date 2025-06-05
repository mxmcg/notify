// API types that match the backend schema

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  scheduledTime: string; // ISO string for when notification should fire
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  isEnabled: boolean;
  notificationId?: string; // Local notification ID
  createdAt: string;
  updatedAt: string;
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
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  error: string | null;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  scheduledTime: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  isEnabled?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  scheduledTime?: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
  isEnabled?: boolean;
}

export interface ProcessTaskRequest {
  customPrompt?: string;
  model?: "gpt-4" | "gpt-3.5-turbo" | "gpt-4-turbo";
}

export interface ProcessLLMRequest {
  prompt: string;
  model?: "gpt-4" | "gpt-3.5-turbo" | "gpt-4-turbo";
}