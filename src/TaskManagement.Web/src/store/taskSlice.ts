import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types';

interface TaskState {
  selectedTask: Task | null;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  filters: {
    searchTerm?: string;
    priorities?: number[];
    userId?: number;
    tagIds?: number[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

const initialState: TaskState = {
  selectedTask: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  filters: {
    searchTerm: undefined,
    priorities: [],
    userId: undefined,
    tagIds: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      const page = Math.max(1, action.payload);
      state.pagination.currentPage = page;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      const pageSize = Math.max(1, Math.min(1000, action.payload));
      state.pagination.itemsPerPage = pageSize;
      state.pagination.currentPage = 1;
    },
    setSearchTerm: (state, action: PayloadAction<string | undefined>) => {
      state.filters.searchTerm = action.payload;
      state.pagination.currentPage = 1;
    },
    setPrioritiesFilter: (state, action: PayloadAction<number[] | undefined>) => {
      const newPriorities = action.payload && action.payload.length > 0 ? [...action.payload] : [];
      state.filters.priorities = newPriorities;
      state.pagination.currentPage = 1;
    },
    setUserIdFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.userId = action.payload;
      state.pagination.currentPage = 1;
    },
    setTagIdsFilter: (state, action: PayloadAction<number[] | undefined>) => {
      const newTagIds = action.payload && action.payload.length > 0 ? [...action.payload] : [];
      state.filters.tagIds = newTagIds;
      state.pagination.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.filters.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sortOrder = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        searchTerm: undefined,
        priorities: [],
        userId: undefined,
        tagIds: [],
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      state.pagination.currentPage = 1;
    },
  },
});


export const {
  setSelectedTask,
  setCurrentPage,
  setItemsPerPage,
  setSearchTerm,
  setPrioritiesFilter,
  setUserIdFilter,
  setTagIdsFilter,
  setSortBy,
  setSortOrder,
  clearFilters
} = taskSlice.actions;
export default taskSlice.reducer;
