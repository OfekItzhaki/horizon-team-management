import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/api';
import { CreateTaskDto, UpdateTaskDto, GetTasksParams } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../utils/errorHandler';

export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (params: GetTasksParams) => [...taskKeys.lists(), params] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: number) => [...taskKeys.details(), id] as const,
};

export function useTasks(params: GetTasksParams) {
    return useQuery({
        queryKey: taskKeys.list(params),
        queryFn: () => taskApi.getAll(params),
    });
}

export function useTask(id: number) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => taskApi.getById(id),
        enabled: !!id,
    });
}

export function useTaskOperations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (task: CreateTaskDto) => taskApi.create(task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            toast.success('Task created successfully');
        },
        onError: (err) => handleApiError(err, 'Failed to create task'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, task }: { id: number; task: UpdateTaskDto }) =>
            taskApi.update(id, task),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.setQueryData(taskKeys.detail(data.id), data);
            toast.success('Task updated successfully');
        },
        onError: (err) => handleApiError(err, 'Failed to update task'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => taskApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            toast.success('Task deleted successfully');
        },
        onError: (err) => handleApiError(err, 'Failed to delete task'),
    });

    return {
        createTask: createMutation.mutateAsync,
        updateTask: updateMutation.mutateAsync,
        deleteTask: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
