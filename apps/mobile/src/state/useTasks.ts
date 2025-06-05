// Bridge between old local state interface and new API state

import { useTasks as useTasksQuery, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { ApiTask, CreateTaskRequest } from '../types/api';

// Updated Task interface for notifications
export interface Task {
  id: string;
  title: string;
  description: string;
  scheduledTime: Date;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  isEnabled: boolean;
  notificationId?: string;
  createdAt: number;
}

// Convert API task to local task format
const apiTaskToLocalTask = (apiTask: ApiTask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  scheduledTime: new Date(apiTask.scheduledTime),
  repeatType: apiTask.repeatType,
  isEnabled: apiTask.isEnabled,
  notificationId: apiTask.notificationId,
  createdAt: new Date(apiTask.createdAt).getTime(),
});

// Convert local task to API format
const localTaskToApiTask = (task: Omit<Task, "id" | "createdAt" | "notificationId">): CreateTaskRequest => ({
  title: task.title,
  description: task.description,
  scheduledTime: task.scheduledTime.toISOString(),
  repeatType: task.repeatType,
  isEnabled: task.isEnabled,
});

// Hook that provides the same interface as the old Zustand store
export const useTasks = () => {
  const { data: apiTasks = [], isLoading, error } = useTasksQuery();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Convert API tasks to local format
  const tasks = apiTasks.map(apiTaskToLocalTask);

  const add = (task: Omit<Task, "id" | "createdAt" | "notificationId">) => {
    const apiTask = localTaskToApiTask(task);
    createTaskMutation.mutate(apiTask);
  };

  const remove = (id: string) => {
    deleteTaskMutation.mutate(id, {
      onError: (error) => {
        console.error('Delete error:', error);
        // You could show a toast or alert here
      },
      onSuccess: () => {
        console.log('Task deleted successfully');
      },
    });
  };

  const update = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      task: {
        title: task.title,
        description: task.description,
        scheduledTime: task.scheduledTime.toISOString(),
        repeatType: task.repeatType,
        isEnabled: task.isEnabled,
      },
    }, {
      onError: (error) => {
        console.error('Update error:', error);
      },
      onSuccess: () => {
        console.log('Task updated successfully');
      },
    });
  };

  return {
    tasks,
    add,
    remove,
    update,
    // Additional state for loading/error handling
    isLoading,
    error,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};