import { Task, ShoppingItem } from '@/types/taskmate';

interface StatsCardsProps {
  tasks: Task[];
  shopping: ShoppingItem[];
  onCompletedTasksClick?: () => void;
  onCompletedShoppingClick?: () => void;
}

export function StatsCards({
  tasks,
  shopping,
  onCompletedTasksClick,
  onCompletedShoppingClick
}: StatsCardsProps) {
  const openTasks = tasks.filter((t) => !t.completed).length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const pendingItems = shopping.filter((i) => !i.checked).length;
  const completedItemsCount = shopping.filter((i) => i.checked).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
      <div className="stat-card">
        <p className="text-2xl md:text-3xl font-bold text-primary">{openTasks}</p>
        <p className="text-xs md:text-sm text-muted-foreground">Compiti aperti</p>
      </div>
      <button
        type="button"
        onClick={onCompletedTasksClick}
        className={`stat-card text-left transition-colors ${
          completedTasksCount > 0 && onCompletedTasksClick
            ? 'cursor-pointer hover:bg-muted/50'
            : 'cursor-default'
        }`}
      >
        <p className="text-2xl md:text-3xl font-bold text-success">{completedTasksCount}</p>
        <p className="text-xs md:text-sm text-muted-foreground">Compiti completati</p>
      </button>
      <div className="stat-card">
        <p className="text-2xl md:text-3xl font-bold text-accent">{pendingItems}</p>
        <p className="text-xs md:text-sm text-muted-foreground">Articoli da comprare</p>
      </div>
      <button
        type="button"
        onClick={onCompletedShoppingClick}
        className={`stat-card text-left transition-colors ${
          completedItemsCount > 0 && onCompletedShoppingClick
            ? 'cursor-pointer hover:bg-muted/50'
            : 'cursor-default'
        }`}
      >
        <p className="text-2xl md:text-3xl font-bold text-success">{completedItemsCount}</p>
        <p className="text-xs md:text-sm text-muted-foreground">Articoli comprati</p>
      </button>
    </div>
  );
}
