import { useState } from 'react';
import { X, Home, Loader2 } from 'lucide-react';

interface CreateHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateHouse: (name: string) => Promise<void>;
}

export function CreateHouseModal({ isOpen, onClose, onCreateHouse }: CreateHouseModalProps) {
  const [houseName, setHouseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!houseName.trim()) {
      setError('Inserisci un nome per la casa');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateHouse(houseName.trim());
      setHouseName('');
      onClose();
    } catch (err) {
      setError('Errore durante la creazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-elegant w-full max-w-md p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <X size={20} className="text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Home size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Crea una nuova casa</h2>
            <p className="text-sm text-muted-foreground">Dai un nome alla tua casa</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-foreground text-sm font-semibold mb-2">
              Nome della casa
            </label>
            <input
              type="text"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="Es. Casa Rossi, Appartamento Centro..."
              className="input-styled"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creazione...
                </>
              ) : (
                'Crea casa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
