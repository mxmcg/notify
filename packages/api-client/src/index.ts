import type {
  Task,
  LLMResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProcessTaskRequest,
  ProcessTaskResponse,
  ProcessLLMRequest,
  ProcessLLMResponse,
  PaginatedResponse,
  APIError,
} from "@notify/shared-types";

export class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string = "http://localhost:4000/api") {
    this.baseURL = baseURL;
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  setAuthToken(token: string) {
    this.headers.Authorization = `Bearer ${token}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIClientError(data.error || "Request failed", response.status, data);
    }

    return data;
  }

  // Task endpoints
  async getTasks(includeLLMResponses: boolean = false): Promise<Task[]> {
    const params = includeLLMResponses ? "?include=llm-responses" : "";
    return this.request<Task[]>(`/tasks${params}`);
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    return this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.request<void>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async processTask(id: string, options: ProcessTaskRequest = {}): Promise<ProcessTaskResponse> {
    return this.request<ProcessTaskResponse>(`/tasks/${id}/process`, {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async getTaskLLMResponses(taskId: string): Promise<LLMResponse[]> {
    return this.request<LLMResponse[]>(`/tasks/${taskId}/responses`);
  }

  async getTaskLLMResponse(taskId: string, responseId: string): Promise<LLMResponse> {
    return this.request<LLMResponse>(`/tasks/${taskId}/responses/${responseId}`);
  }

  // LLM endpoints
  async processWithLLM(options: ProcessLLMRequest): Promise<ProcessLLMResponse> {
    return this.request<ProcessLLMResponse>("/llm/process", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async getLLMResponse(responseId: string): Promise<LLMResponse> {
    return this.request<LLMResponse>(`/llm/responses/${responseId}`);
  }

  async getLLMResponses(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<LLMResponse>> {
    return this.request<PaginatedResponse<LLMResponse>>(
      `/llm/responses?page=${page}&limit=${limit}`
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    return this.request("/health");
  }
}

export class APIClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "APIClientError";
  }
}

// Default client instance
export const apiClient = new APIClient();

// Export types for convenience
export * from "@notify/shared-types";