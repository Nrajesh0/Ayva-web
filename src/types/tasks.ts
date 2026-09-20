export type TaskType = 'TASK' | 'BIRTHDAY' | 'ANNIVERSARY';

export type RecurrencePattern = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface TaskEntity {
  id: number | string;
  title: string;
  details: string;
  dueDate: number | null;
  isCompleted: boolean;
  type: TaskType;
  recurrence: RecurrencePattern;
  isPersistent: boolean;
  isPriority: boolean;
  completedAt: number | null;
  category?: string;
  createdAt: number;
  updatedAt: number;
  // Zero-Knowledge sync
  isEncrypted?: boolean;
  encryptedBlob?: string;
}
