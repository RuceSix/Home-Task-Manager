import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ChildEventType } from '@/types/taskmate';

const LABELS: Record<ChildEventType, string> = {
  latte: 'Latte',
  sonno: 'Sonno',
  pannolino: 'Pannolino',
  peso: 'Peso'
};

interface ChildEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: ChildEventType;
  onAdd: (data: { quantity?: number; durationMinutes?: number; note?: string }) => void;
}

export function ChildEventModal({ isOpen, onClose, eventType, onAdd }: ChildEventModalProps) {
  const [quantity, setQuantity] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (eventType === 'latte') {
      const ml = parseInt(quantity, 10);
      if (!isNaN(ml) && ml > 0) {
        onAdd({ quantity: ml });
        onClose();
      }
    } else if (eventType === 'sonno') {
      const h = parseInt(durationHours, 10) || 0;
      const m = parseInt(durationMins, 10) || 0;
      const total = h * 60 + m;
      if (total > 0) {
        onAdd({ durationMinutes: total });
        onClose();
      }
    } else if (eventType === 'pannolino') {
      onAdd({ note: note || 'pipi' }); // note = pipi|cacca|entrambi
      onClose();
    } else if (eventType === 'peso') {
      const kg = parseFloat(weight.replace(',', '.'));
      if (!isNaN(kg) && kg > 0) {
        onAdd({ quantity: kg });
        onClose();
      }
    }
    setIsLoading(false);
  };

  const label = LABELS[eventType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50"
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold mb-4">Aggiungi {label}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {eventType === 'latte' && (
            <div>
              <label className="block text-sm font-medium mb-1">Quantità (ml)</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="120"
                className="input-styled w-full"
                autoFocus
              />
            </div>
          )}
          {eventType === 'sonno' && (
            <div className="flex gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ore</label>
                <input
                  type="number"
                  min={0}
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="1"
                  className="input-styled w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minuti</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  placeholder="30"
                  className="input-styled w-full"
                />
              </div>
            </div>
          )}
          {eventType === 'pannolino' && (
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={note || 'pipi'}
                onChange={(e) => setNote(e.target.value)}
                className="input-styled w-full"
              >
                <option value="pipi">Pipì</option>
                <option value="cacca">Cacca</option>
                <option value="entrambi">Entrambi</option>
              </select>
            </div>
          )}
          {eventType === 'peso' && (
            <div>
              <label className="block text-sm font-medium mb-1">Peso (kg)</label>
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^0-9,.]/g, ''))}
                placeholder="3.5"
                className="input-styled w-full"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl bg-secondary">
              Annulla
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Aggiungi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
