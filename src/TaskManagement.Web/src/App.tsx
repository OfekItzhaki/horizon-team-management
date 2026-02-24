import { useEffect, useState, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
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
} from './store/taskSlice';
import { fetchTags } from './store/tagSlice';
import { fetchUsers } from './store/userSlice';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import FloatingActionButton from './components/FloatingActionButton';
import ErrorFallback from './components/ErrorFallback';
import VersionFooter from './components/VersionFooter';
import { CreateTaskDto, UpdateTaskDto, Task, GetTasksParams } from './types';
import { useArrayKey } from './hooks/useArrayKey';
import { configure } from './sdk/config';
import { useAuth } from './context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useTasks, useTaskOperations } from './hooks/useTasks';

// Configure Horizon SDK
configure({
  authBaseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:3001',
  baseURL: import.meta.env.VITE_API_URL || '/api',
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
});

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const isAuthenticated = !!user;
  const dispatch = useAppDispatch();
  const pagination = useAppSelector((state) => state.tasks.pagination);
  const tagIds = useAppSelector((state) => state.tasks.filters.tagIds) ?? [];
  const priorities = useAppSelector((state) => state.tasks.filters.priorities) ?? [];
  const searchTerm = useAppSelector((state) => state.tasks.filters.searchTerm);
  const userId = useAppSelector((state) => state.tasks.filters.userId);
  const sortBy = useAppSelector((state) => state.tasks.filters.sortBy ?? 'createdAt');
  const sortOrder = useAppSelector((state) => state.tasks.filters.sortOrder ?? 'desc');
  const { tags } = useAppSelector((state) => state.tags);
  const { users } = useAppSelector((state) => state.users);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? stored === 'true' : false;
  });

  const tagIdsKey = useArrayKey(tagIds);
  const prioritiesKey = useArrayKey(priorities);

  // Memoize query params to avoid unnecessary refetches
  const queryParams: GetTasksParams = useMemo(() => ({
    page: pagination.currentPage,
    pageSize: pagination.itemsPerPage,
    searchTerm: searchTerm || undefined,
    priorities: priorities.length > 0 ? priorities : undefined,
    userId: userId || undefined,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    sortBy,
    sortOrder,
  }), [
    pagination.currentPage,
    pagination.itemsPerPage,
    searchTerm,
    prioritiesKey,
    userId,
    tagIdsKey,
    sortBy,
    sortOrder
  ]);

  // React Query Hooks
  const { data, isLoading: tasksLoading, error: tasksError } = useTasks(queryParams);
  const { createTask, updateTask, deleteTask } = useTaskOperations();

  const tasks = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTags());
      dispatch(fetchUsers());
    }
  }, [dispatch, isAuthenticated]);

  const handleCreateTask = async (data: CreateTaskDto) => {
    if (!data.createdByUserId || data.createdByUserId === 0) {
      if (data.userIds && data.userIds.length > 0) {
        data.createdByUserId = data.userIds[0];
      } else {
        return;
      }
    }
    await createTask(data);
    setShowForm(false);
  };

  const handleUpdateTask = async (data: CreateTaskDto) => {
    if (!editingTask) return;
    const updateData: UpdateTaskDto = {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      userIds: data.userIds || [],
      tagIds: data.tagIds || [],
      rowVersion: editingTask.rowVersion,
    };
    await updateTask({ id: editingTask.id, task: updateData });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
    dispatch(setSelectedTask(task));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    dispatch(setSelectedTask(null));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    dispatch(setItemsPerPage(itemsPerPage));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Horizon...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50/50 dark:bg-[#020617] transition-colors duration-500">
                <header className="glass-card border-b border-gray-200 dark:border-gray-700/30 sticky top-0 z-50 backdrop-blur-xl mb-6 bg-white/70 dark:bg-gray-900/60">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                          Horizon Tasks
                        </h1>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Authenticated as</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user?.email || user?.name}</span>
                        </div>

                        <button
                          onClick={() => setDarkMode(!darkMode)}
                          className="p-2.5 glass-card rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                          aria-label="Toggle dark mode"
                        >
                          {darkMode ? (
                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => logout()}
                          className="p-2.5 glass-card rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all duration-300"
                          aria-label="Logout"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" style={{ position: 'relative', overflow: 'visible' }}>
                  {tasksError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                      <p className="text-red-800 dark:text-red-200">Error: {(tasksError as any).message || 'Failed to fetch tasks'}</p>
                    </div>
                  )}

                  {showForm ? (
                    <div className="glass-card p-8 max-w-2xl mx-auto" style={{ position: 'relative', overflow: 'visible' }}>
                      <h2 className="premium-header-section mb-6">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                      <TaskForm
                        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                        initialData={
                          editingTask
                            ? {
                              title: editingTask.title,
                              description: editingTask.description,
                              dueDate: editingTask.dueDate.split('T')[0],
                              priority: editingTask.priority,
                              createdByUserId: editingTask.createdByUserId,
                              userIds: editingTask.users.map((ut) => ut.user.id),
                              tagIds: editingTask.tags.map((t) => t.id),
                            }
                            : {
                              createdByUserId: users.length > 0 ? users[0].id : 0,
                            }
                        }
                        tags={tags}
                        users={users.map(u => ({ id: u.id, fullName: u.fullName }))}
                        onCancel={handleCancel}
                      />
                    </div>
                  ) : (
                    <>
                      <TaskFilters
                        searchTerm={searchTerm || ''}
                        priorities={priorities}
                        userId={userId}
                        tagIds={tagIds}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        users={users}
                        tags={tags}
                        onSearchChange={(value) => dispatch(setSearchTerm(value))}
                        onPrioritiesChange={(value) => dispatch(setPrioritiesFilter(value))}
                        onUserIdChange={(value) => dispatch(setUserIdFilter(value))}
                        onTagIdsChange={(value) => dispatch(setTagIdsFilter(value))}
                        onSortByChange={(value) => dispatch(setSortBy(value))}
                        onSortOrderChange={(value) => dispatch(setSortOrder(value))}
                        onClearFilters={() => dispatch(clearFilters())}
                      />
                      <TaskList
                        tasks={tasks}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        loading={tasksLoading}
                        currentPage={pagination.currentPage}
                        itemsPerPage={pagination.itemsPerPage}
                        totalItems={totalCount}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                      />
                    </>
                  )}
                </main>

                {!showForm && (
                  <FloatingActionButton
                    onClick={() => setShowForm(true)}
                    ariaLabel="Create New Task"
                  />
                )}

                <VersionFooter />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
