import { useState } from 'react';
import { X, ShoppingCart, Loader2 } from 'lucide-react';
import { HouseMember } from '@/types/taskmate';
import { AssigneeSelector } from './AssigneeSelector';

const CATEGORIE_SPESA = [
  'Ortofrutta',
  'Latticini e uova',
  'Carne e pesce',
  'Pasta e riso',
  'Pane e prodotti da forno',
  'Bevande',
  'Dolci e snack',
  'Pulizia casa',
  'Igiene personale',
  'Altro'
] as const;

const UNITA_MISURA = [
  'pezzi',
  'kg',
  'g',
  'litri',
  'ml',
  'bottiglia',
  'pacchetto',
  'confezione',
  'busta',
  'barattolo',
  'scatola'
] as const;

interface AddShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: HouseMember[];
  currentUserId: string;
  currentUserName: string;
  onAdd: (item: string, quantity: number, unit: string, category: string, assigneeId: string, assigneeName: string) => void;
}

export function AddShoppingModal({
  isOpen,
  onClose,
  members,
  currentUserId,
  currentUserName,
  onAdd
}: AddShoppingModalProps) {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<string>(UNITA_MISURA[0]);
  const [category, setCategory] = useState<string>(CATEGORIE_SPESA[0]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(currentUserId);
  const [selectedAssigneeName, setSelectedAssigneeName] = useState(currentUserName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!item.trim()) {
      setError('Inserisci il prodotto da comprare');
      return;
    }
    setIsLoading(true);
    try {
      onAdd(
        item.trim(),
        quantity >= 1 ? quantity : 1,
        unit || 'pezzi',
        category || 'Altro',
        selectedAssigneeId,
        selectedAssigneeName
      );
      setItem('');
      setQuantity(1);
      setUnit(UNITA_MISURA[0]);
      setCategory(CATEGORIE_SPESA[0]);
      setSelectedAssigneeId(currentUserId);
      setSelectedAssigneeName(currentUserName);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneeChange = (memberId: string, memberName: string) => {
    setSelectedAssigneeId(memberId);
    setSelectedAssigneeName(memberName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <X size={20} className="text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Nuova spesa</h2>
            <p className="text-sm text-muted-foreground">Aggiungi un articolo alla lista</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Prodotto</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Es. Latte, Pane, Mele..."
              className="input-styled w-full"
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Quantità</label>
              <input
                type="number"
                min={1}
                max={999}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="input-styled w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Unità di misura</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-styled w-full"
              >
                {UNITA_MISURA.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-styled w-full"
            >
              {CATEGORIE_SPESA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Assegna a</label>
              <AssigneeSelector
                members={members}
                selectedMemberId={selectedAssigneeId}
                onSelect={handleAssigneeChange}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Aggiungi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
