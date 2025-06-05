// Task API service functions

import { apiClient, API_CONFIG } from '../config/api';
import { ApiTask, CreateTaskRequest, UpdateTaskRequest, ProcessTaskRequest } from '../types/api';

export const taskApi = {
  // Get all tasks
  getTasks: (): Promise<ApiTask[]> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.TASKS);
  },

  // Get a specific task
  getTask: (id: string): Promise<ApiTask> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`);
  },

  // Create a new task
  createTask: (task: CreateTaskRequest): Promise<ApiTask> => {
    return apiClient.post(API_CONFIG.ENDPOINTS.TASKS, task);
  },

  // Update a task
  updateTask: (id: string, task: UpdateTaskRequest): Promise<ApiTask> => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`, task);
  },

  // Delete a task
  deleteTask: (id: string): Promise<void> => {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`);
  },

  // Process a task with LLM
  processTask: (id: string, request: ProcessTaskRequest): Promise<any> => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.TASKS}/${id}/process`, request);
  },

  // Get task responses
  getTaskResponses: (id: string): Promise<any[]> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.TASKS}/${id}/responses`);
  },
};