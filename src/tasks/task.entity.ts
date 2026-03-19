export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};
