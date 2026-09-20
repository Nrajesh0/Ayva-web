import React, { useState } from 'react';
import { TaskEntity, TaskType, RecurrencePattern } from '../types/tasks';
import { db } from '../db/database';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Plus,
  Star,
  Calendar,
  Repeat,
  Trash2,
  Cake,
  Heart,
  Tag,
  Clock,
  ShieldCheck,
  Flame,
  Filter,
  Check
} from 'lucide-react';

interface TodoListPaneProps {
  tasks: TaskEntity[];
  onAddTask: (task: Omit<TaskEntity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (task: TaskEntity) => void;
  onDeleteTask: (id: number | string) => void;
}

type TaskFilter = 'ALL' | 'TODAY' | 'UPCOMING' | 'PRIORITY' | 'EVENTS' | 'COMPLETED';

export const TodoListPane: React.FC<TodoListPaneProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TaskType>('TASK');
  const [newPriority, setNewPriority] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState<RecurrencePattern>('NONE');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newCategory, setNewCategory] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Derive unique categories
  const categories = Array.from(
    new Set(tasks.map(t => t.category).filter(Boolean))
  ) as string[];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let dueTimestamp: number | null = null;
    if (newDueDate) {
      dueTimestamp = new Date(newDueDate).getTime();
    }

    onAddTask({
      title: newTitle.trim(),
      details: '',
      dueDate: dueTimestamp,
      isCompleted: false,
      type: newType,
      recurrence: newRecurrence,
      isPersistent: false,
      isPriority: newPriority,
      completedAt: null,
      category: newCategory.trim() || undefined
    });

    setNewTitle('');
    setNewPriority(false);
    setNewRecurrence('NONE');
    setNewDueDate('');
    setNewCategory('');
    setShowAdvancedOptions(false);
  };

  const toggleTaskCompletion = (task: TaskEntity) => {
    const isNowCompleted = !task.isCompleted;

    if (isNowCompleted) {
      // Trigger joyful celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#22C55E', '#4ADE80', '#86EFAC', '#F59E0B']
        });
      } catch {}
    }

    onUpdateTask({
      ...task,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? Date.now() : null,
      updatedAt: Date.now()
    });
  };

  const toggleTaskPriority = (task: TaskEntity) => {
    onUpdateTask({
      ...task,
      isPriority: !task.isPriority,
      updatedAt: Date.now()
    });
  };

  // Filter calculations
  const now = Date.now();
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const endOfToday = new Date().setHours(23, 59, 59, 999);

  const filteredTasks = tasks.filter(task => {
    // Category filter
    if (selectedCategory && task.category !== selectedCategory) {
      return false;
    }

    switch (activeFilter) {
      case 'TODAY':
        return (
          !task.isCompleted &&
          task.dueDate &&
          task.dueDate >= startOfToday &&
          task.dueDate <= endOfToday
        );
      case 'UPCOMING':
        return !task.isCompleted && task.dueDate && task.dueDate > endOfToday;
      case 'PRIORITY':
        return !task.isCompleted && task.isPriority;
      case 'EVENTS':
        return task.type === 'BIRTHDAY' || task.type === 'ANNIVERSARY';
      case 'COMPLETED':
        return task.isCompleted;
      case 'ALL':
      default:
        return !task.isCompleted;
    }
  });

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const pendingCount = tasks.filter(t => !t.isCompleted).length;

  return (
    <div className="flex h-full flex-col bg-[#0F1115]">
      {/* Header */}
      <div className="border-b border-[#262B35] bg-[#161920] px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
              Focus Tasks & Events
            </h1>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              {pendingCount} pending · {completedCount} completed · Sync-ready with Android Room DB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-1 text-xs font-semibold text-[#22C55E]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Offline First
            </span>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFilter === 'ALL'
                ? 'bg-[#22C55E] text-[#0F1115] font-bold'
                : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
            }`}
          >
            All Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('TODAY')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFilter === 'TODAY'
                ? 'bg-[#22C55E] text-[#0F1115] font-bold'
                : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveFilter('UPCOMING')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFilter === 'UPCOMING'
                ? 'bg-[#22C55E] text-[#0F1115] font-bold'
                : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('PRIORITY')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFilter === 'PRIORITY'
                ? 'bg-[#22C55E] text-[#0F1115] font-bold'
                : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
            }`}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Priority
          </button>
          <button
            onClick={() => setActiveFilter('EVENTS')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFilter === 'EVENTS'
                ? 'bg-[#22C55E] text-[#0F1115] font-bold'
                : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
            }`}
          >
            <Cake className="h-3 w-3 text-pink-400" />
            Birthdays & Anniversaries
          </button>
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFilter === 'COMPLETED'
                ? 'bg-[#22C55E] text-[#0F1115] font-bold'
                : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#262B35]/60 pt-3">
            <span className="text-[11px] font-semibold text-[#6B7280]">Category:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                selectedCategory === null
                  ? 'bg-[#1E232D] text-[#22C55E] ring-1 ring-[#22C55E]'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                  selectedCategory === cat
                    ? 'bg-[#1E232D] text-[#22C55E] ring-1 ring-[#22C55E]'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                #{cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task Creation Bar */}
      <div className="border-b border-[#262B35] bg-[#12151B] p-6">
        <form onSubmit={handleCreateTask} className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 rounded-2xl border border-[#262B35] bg-[#161920] p-2 shadow-lg focus-within:border-[#22C55E]">
            <button
              type="button"
              onClick={() => setNewPriority(!newPriority)}
              className="p-2 text-[#9CA3AF] transition hover:text-amber-400"
              title="Toggle Priority"
            >
              <Star
                className={`h-5 w-5 ${
                  newPriority ? 'fill-amber-400 text-amber-400' : 'text-[#6B7280]'
                }`}
              />
            </button>

            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="What needs to be focused on? (Press Enter to add)..."
              className="flex-1 bg-transparent text-sm text-[#F9FAFB] placeholder-[#6B7280] outline-none"
            />

            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                showAdvancedOptions || newDueDate || newCategory || newRecurrence !== 'NONE'
                  ? 'bg-[#1E232D] text-[#22C55E]'
                  : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
            </button>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-[#0F1115] transition hover:bg-[#16A34A] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>

          {/* Advanced options expansion */}
          {showAdvancedOptions && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[#262B35] bg-[#161920] p-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#9CA3AF]" />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="rounded bg-[#1E232D] px-2 py-1 text-xs text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-[#9CA3AF]" />
                <select
                  value={newRecurrence}
                  onChange={e => setNewRecurrence(e.target.value as RecurrencePattern)}
                  className="rounded bg-[#1E232D] px-2 py-1 text-xs text-[#F9FAFB] outline-none"
                >
                  <option value="NONE">No Recurrence</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Category (e.g. Work)"
                  className="w-28 rounded bg-[#1E232D] px-2 py-1 text-xs text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as TaskType)}
                  className="rounded bg-[#1E232D] px-2 py-1 text-xs text-[#F9FAFB] outline-none"
                >
                  <option value="TASK">Task</option>
                  <option value="BIRTHDAY">🎂 Birthday</option>
                  <option value="ANNIVERSARY">💖 Anniversary</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#22C55E]/40" />
              <h3 className="mt-4 text-base font-semibold text-[#F9FAFB]">
                No tasks found in this view
              </h3>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                All clear! Add a task above to keep your momentum going.
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  task.isCompleted
                    ? 'border-[#262B35] bg-[#161920]/40 opacity-70'
                    : 'border-[#262B35] bg-[#161920] hover:border-[#333A48]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Completion checkbox button */}
                  <button
                    onClick={() => toggleTaskCompletion(task)}
                    className="p-0.5 transition"
                    title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#4B5563] hover:text-[#22C55E]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      {task.type === 'BIRTHDAY' && (
                        <Cake className="h-4 w-4 text-pink-400" />
                      )}
                      {task.type === 'ANNIVERSARY' && (
                        <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          task.isCompleted
                            ? 'text-[#6B7280] line-through'
                            : 'text-[#F9FAFB]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {/* Meta Badges */}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#9CA3AF]">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.recurrence && task.recurrence !== 'NONE' && (
                        <span className="flex items-center gap-1 rounded bg-[#1E232D] px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                          <Repeat className="h-2.5 w-2.5" />
                          {task.recurrence}
                        </span>
                      )}
                      {task.category && (
                        <span className="rounded bg-[#1E232D] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]">
                          #{task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleTaskPriority(task)}
                    className="p-1 text-[#6B7280] transition hover:text-amber-400"
                    title="Toggle Priority"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        task.isPriority
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#4B5563]'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="rounded p-1 text-[#4B5563] opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
