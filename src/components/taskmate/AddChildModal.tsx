import { useState } from 'react';
import { X, Baby, Loader2 } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, birthDate: string, childType: 'neonato' | 'bambino', notes: string) => void;
}

export function AddChildModal({
  isOpen,
  onClose,
  onAdd
}: AddChildModalProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [childType, setChildType] = useState<'neonato' | 'bambino'>('bambino');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Inserisci il nome');
      return;
    }
    if (!birthDate) {
      setError('Inserisci la data di nascita');
      return;
    }
    setIsLoading(true);
    try {
      onAdd(name.trim(), birthDate, childType, notes.trim());
      setName('');
      setBirthDate(new Date().toISOString().split('T')[0]);
      setChildType('bambino');
      setNotes('');
      onClose();
    } finally {
      setIsLoading(false);
    }
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
            <Baby size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Aggiungi bambino</h2>
            <p className="text-sm text-muted-foreground">Neonato o bambino della famiglia</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Marco, Sofia..."
              className="input-styled w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Data di nascita</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input-styled w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
            <select
              value={childType}
              onChange={(e) => setChildType(e.target.value as 'neonato' | 'bambino')}
              className="input-styled w-full"
            >
              <option value="neonato">Neonato (0–12 mesi)</option>
              <option value="bambino">Bambino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Note (opzionale)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergie, preferenze, medicinali..."
              className="input-styled w-full min-h-[80px] resize-none"
              rows={3}
            />
          </div>

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
