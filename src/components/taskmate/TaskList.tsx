import { useState, useMemo } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, User, Users, Search, ArrowUpDown } from 'lucide-react';
import { Task, HouseMember } from '@/types/taskmate';
import { AddTaskModal } from './AddTaskModal';

type TaskSortOption = 'date' | 'assignee' | 'category';

interface TaskListProps {
  tasks: Task[];
  members: HouseMember[];
  currentUserId: string;
  currentUserName: string;
  onAddTask: (title: string, assigneeId: string, assigneeName: string, dueDate: string, category: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

export function TaskList({
  tasks,
  members,
  currentUserId,
  currentUserName,
  onAddTask,
  onToggleTask,
  onDeleteTask
}: TaskListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TaskSortOption>('date');

  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId);
  const allDisplayed = showAllMembers ? tasks : myTasks;
  const pendingTasks = useMemo(() => {
    let filtered = allDisplayed.filter((t) => !t.completed);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.category?.toLowerCase().includes(q)) ||
        (t.assignee?.toLowerCase().includes(q))
      );
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'assignee') {
        return (a.assignee || '').localeCompare(b.assignee || '');
      }
      if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });
  }, [allDisplayed, searchQuery, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* Header con toggle e pulsante Nuova attività */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAllMembers(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showAllMembers
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            <User size={16} />
            Solo i miei
          </button>
          <button
            onClick={() => setShowAllMembers(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAllMembers
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Users size={16} />
            Tutti i membri
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-2.5 flex items-center gap-2 w-fit"
        >
          <Plus size={20} />
          Nuova attività
        </button>
      </div>

      {/* Ricerca e ordinamento */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca attività..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-styled pl-10 w-full"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TaskSortOption)}
            className="input-styled pl-10 pr-8 appearance-none min-w-[140px]"
          >
            <option value="date">Per data</option>
            <option value="assignee">Per assegnatario</option>
            <option value="category">Per categoria</option>
          </select>
          <ArrowUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {showAllMembers
          ? `${pendingTasks.length} attivit${pendingTasks.length === 1 ? 'à' : 'à'} da fare`
          : `${pendingTasks.length} attivit${pendingTasks.length === 1 ? 'à' : 'à'} assegnate a te`}
      </p>

      {/* Lista compiti da fare */}
      <div className="space-y-3">
        {pendingTasks.map((task, index) => (
          <div
            key={task.id}
            className="task-item task-item-pending animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => onToggleTask(task.id)}
                className="checkbox-circle flex-shrink-0 checkbox-unchecked"
              >
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">
                  {task.title}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString('it-IT')}
                  </span>
                  {task.category && task.category.toLowerCase() !== 'generale' && (
                    <span className="bg-muted px-2 py-0.5 rounded text-xs">{task.category}</span>
                  )}
                  {showAllMembers && task.assignee && (
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {task.assignee}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-destructive hover:text-destructive/80 p-2 rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {pendingTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          <CheckSquare size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">
            {searchQuery.trim()
              ? 'Nessun risultato per la ricerca'
              : showAllMembers
                ? 'Nessuna attività'
                : 'Nessuna attività assegnata a te'}
          </p>
          <p className="text-sm mb-4">
            {searchQuery.trim()
              ? 'Prova con altri termini di ricerca.'
              : showAllMembers
                ? 'Non ci sono compiti per nessun membro.'
                : 'Non hai attività assegnate. Aggiungi una nuova attività!'}
          </p>
          {!searchQuery.trim() && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-6 py-2.5 flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Nuova attività
            </button>
          )}
        </div>
      )}

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        members={members}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onAdd={onAddTask}
      />
    </div>
  );
}
