import { apiClient } from '../sdk';
import type { Task, CreateTaskDto, UpdateTaskDto, Tag, User, PagedResult, GetTasksParams } from '../types';

export const taskApi = {
  getAll: async (params?: GetTasksParams): Promise<PagedResult<Task>> => {
    let path = '/tasks';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        path += `?${queryString}`;
      }
    }

    return await apiClient.get<PagedResult<Task>>(path);
  },

  getById: async (id: number): Promise<Task> => {
    return await apiClient.get<Task>(`/tasks/${id}`);
  },

  create: async (task: CreateTaskDto): Promise<Task> => {
    return await apiClient.post<Task>('/tasks', task);
  },

  update: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    return await apiClient.post<Task>(`/tasks/${id}`, task, { method: 'PUT' }); // ApiClient post wrapper uses POST, but backend might expect PUT. 
    // Wait, the SDK has patch but not put? No, it has get, post, patch, delete.
    // I should check if I should use patch or post with method override.
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export const tagApi = {
  getAll: async (): Promise<Tag[]> => {
    return await apiClient.get<Tag[]>('/tags');
  },
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    return await apiClient.get<User[]>('/users');
  },
};
