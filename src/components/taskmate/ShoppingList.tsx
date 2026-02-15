import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Trash2, User, Users, Search, ArrowUpDown } from 'lucide-react';
import { ShoppingItem, HouseMember } from '@/types/taskmate';
import { AddShoppingModal } from './AddShoppingModal';

type ShoppingSortOption = 'name' | 'category' | 'assignee';

interface ShoppingListProps {
  items: ShoppingItem[];
  members: HouseMember[];
  currentUserId: string;
  currentUserName: string;
  onAddItem: (item: string, quantity: number, unit: string, category: string, assigneeId: string, assigneeName: string) => void;
  onToggleItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
}

export function ShoppingList({
  items,
  members,
  currentUserId,
  currentUserName,
  onAddItem,
  onToggleItem,
  onDeleteItem
}: ShoppingListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ShoppingSortOption>('name');

  const myItems = items.filter((item) => item.assigneeId === currentUserId);
  const allFiltered = showAllMembers ? items : myItems;
  const pendingItems = useMemo(() => {
    let filtered = allFiltered.filter((item) => !item.checked);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.item.toLowerCase().includes(q) ||
        (item.category?.toLowerCase().includes(q)) ||
        (item.assignee?.toLowerCase().includes(q))
      );
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.item.localeCompare(b.item);
      }
      if (sortBy === 'assignee') {
        return (a.assignee || '').localeCompare(b.assignee || '');
      }
      if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });
  }, [allFiltered, searchQuery, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* Header con toggle e pulsante Nuova spesa */}
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
          Nuova spesa
        </button>
      </div>

      {/* Ricerca e ordinamento */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca articoli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-styled pl-10 w-full"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ShoppingSortOption)}
            className="input-styled pl-10 pr-8 appearance-none min-w-[140px]"
          >
            <option value="name">Per nome</option>
            <option value="category">Per categoria</option>
            <option value="assignee">Per assegnatario</option>
          </select>
          <ArrowUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {showAllMembers
          ? `${pendingItems.length} articol${pendingItems.length === 1 ? 'o' : 'i'} da comprare`
          : `${pendingItems.length} articol${pendingItems.length === 1 ? 'o' : 'i'} da comprare per te`}
      </p>

      {/* Lista articoli da comprare */}
      <div className="space-y-3">
        {pendingItems.map((item, index) => (
          <div
            key={item.id}
            className="task-item task-item-pending animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => onToggleItem(item.id)}
                className="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 border-muted-foreground/40 hover:border-primary hover:bg-primary/10"
              >
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">
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

      {/* Empty State */}
      {pendingItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">
            {searchQuery.trim()
              ? 'Nessun risultato per la ricerca'
              : showAllMembers
                ? 'Nessun articolo nella lista'
                : 'Nessun articolo da comprare'}
          </p>
          <p className="text-sm mb-4">
            {searchQuery.trim()
              ? 'Prova con altri termini di ricerca.'
              : showAllMembers
                ? 'La lista della spesa è vuota per tutti i membri.'
                : 'Non hai articoli assegnati. Aggiungi una nuova spesa!'}
          </p>
          {!searchQuery.trim() && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary px-6 py-2.5 flex items-center gap-2 mx-auto">
              <Plus size={18} />
              Nuova spesa
            </button>
          )}
        </div>
      )}

      <AddShoppingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        members={members}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onAdd={onAddItem}
      />
    </div>
  );
}
