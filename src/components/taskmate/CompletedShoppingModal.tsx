import { useMemo } from 'react';
import { X, ShoppingCart, Check, User, Trash2 } from 'lucide-react';
import { ShoppingItem } from '@/types/taskmate';

function getCompletionDateLabel(isoString: string | undefined): string {
  if (!isoString) return 'Data sconosciuta';
  const d = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dNorm = new Date(d);
  dNorm.setHours(0, 0, 0, 0);
  if (dNorm.getTime() === today.getTime()) return 'Oggi';
  if (dNorm.getTime() === yesterday.getTime()) return 'Ieri';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface CompletedShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  showAllMembers: boolean;
  onToggleItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
}

export function CompletedShoppingModal({
  isOpen,
  onClose,
  items,
  showAllMembers,
  onToggleItem,
  onDeleteItem
}: CompletedShoppingModalProps) {
  const completedItems = items.filter((i) => i.checked);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    const order: string[] = [];
    const sorted = [...completedItems].sort((a, b) => {
      const da = a.checkedAt ? new Date(a.checkedAt).getTime() : 0;
      const db = b.checkedAt ? new Date(b.checkedAt).getTime() : 0;
      return db - da;
    });
    for (const item of sorted) {
      const label = getCompletionDateLabel(item.checkedAt);
      if (!groups[label]) {
        groups[label] = [];
        order.push(label);
      }
      groups[label].push(item);
    }
    const priority = (l: string) => {
      if (l === 'Oggi') return 0;
      if (l === 'Ieri') return 1;
      if (l === 'Data sconosciuta') return 999;
      return 2;
    };
    order.sort((a, b) => priority(a) - priority(b));
    return { groups, order };
  }, [completedItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Check size={24} className="text-success" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Articoli comprati</h2>
              <p className="text-sm text-muted-foreground">
                {completedItems.length} articol{completedItems.length === 1 ? 'o' : 'i'} comprat{completedItems.length === 1 ? 'o' : 'i'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {completedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nessun articolo comprato</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByDate.order.map((dateLabel) => (
                <div key={dateLabel}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-card/95 backdrop-blur py-1">
                    {dateLabel}
                  </h3>
                  <div className="space-y-2">
                    {groupedByDate.groups[dateLabel].map((item) => (
                      <div
                        key={item.id}
                        className="task-item task-item-completed flex items-center gap-4 p-4 rounded-xl"
                      >
                        <button
                          onClick={() => onToggleItem(item.id)}
                          className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 bg-success border-success"
                        >
                          <Check size={14} className="text-success-foreground" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate line-through text-muted-foreground">
                            {item.item}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                            <span>
                              {item.quantity} {item.unit || 'pezzi'}
                            </span>
                            {item.category && (
                              <span className="bg-muted px-2 py-0.5 rounded text-xs">{item.category}</span>
                            )}
                            {showAllMembers && item.assignee && (
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {item.assignee}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive/80 p-2 rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
