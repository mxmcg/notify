// Custom React Query hooks for tasks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/taskApi';
import { ApiTask, CreateTaskRequest, UpdateTaskRequest, ProcessTaskRequest } from '../types/api';

// Query keys
export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TASK_KEYS.lists(), { filters }] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
  responses: (id: string) => [...TASK_KEYS.detail(id), 'responses'] as const,
};

// Get all tasks
export const useTasks = () => {
  return useQuery({
    queryKey: TASK_KEYS.lists(),
    queryFn: () => taskApi.getTasks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific task
export const useTask = (id: string) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
  });
};

// Create a new task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: CreateTaskRequest) => taskApi.createTask(task),
    onSuccess: (newTask) => {
      // Update the tasks list
      queryClient.setQueryData<ApiTask[]>(TASK_KEYS.lists(), (old) => {
        return old ? [...old, newTask] : [newTask];
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
};

// Update a task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: UpdateTaskRequest }) => 
      taskApi.updateTask(id, task),
    onSuccess: (updatedTask, { id }) => {
      // Update the specific task
      queryClient.setQueryData(TASK_KEYS.detail(id), updatedTask);
      // Update the task in the list
      queryClient.setQueryData<ApiTask[]>(TASK_KEYS.lists(), (old) => {
        return old?.map((task) => task.id === id ? updatedTask : task);
      });
    },
  });
};

// Delete a task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: (_, id) => {
      // Remove from the list
      queryClient.setQueryData<ApiTask[]>(TASK_KEYS.lists(), (old) => {
        return old?.filter((task) => task.id !== id);
      });
      // Remove the detail cache
      queryClient.removeQueries({ queryKey: TASK_KEYS.detail(id) });
    },
  });
};

// Process a task with LLM
export const useProcessTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ProcessTaskRequest }) => 
      taskApi.processTask(id, request),
    onSuccess: (_, { id }) => {
      // Invalidate task responses to refetch
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.responses(id) });
      // Optionally invalidate the task detail to get updated data
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
    },
  });
};

// Get task responses
export const useTaskResponses = (id: string) => {
  return useQuery({
    queryKey: TASK_KEYS.responses(id),
    queryFn: () => taskApi.getTaskResponses(id),
    enabled: !!id,
  });
};