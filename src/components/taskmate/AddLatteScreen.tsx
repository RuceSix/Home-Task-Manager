import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface AddLatteScreenProps {
  onBack: () => void;
  onSave: (quantity: number, eventTime: string, note: string) => void;
}

export function AddLatteScreen({ onBack, onSave }: AddLatteScreenProps) {
  const [quantity, setQuantity] = useState(120);
  const [eventTime, setEventTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');

  const handleSave = () => {
    const [h, m] = eventTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    onSave(quantity, d.toISOString(), note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Latte / Biberon</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="card-elevated p-6 rounded-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-4">Quantità (ml)</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setQuantity(Math.max(0, quantity - 30))}
              className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold hover:bg-secondary/80"
            >
              −
            </button>
            <span className="text-4xl font-bold w-24 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 30)}
              className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold hover:bg-secondary/80"
            >
              +
            </button>
          </div>
          <Slider
            value={[quantity]}
            onValueChange={([v]) => setQuantity(v)}
            min={0}
            max={300}
            step={10}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Orario</label>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="input-styled w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Note (opzionale)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Scrivi una nota..."
            className="input-styled w-full min-h-[80px] resize-none"
          />
        </div>
      </div>

      <div className="p-4 border-t">
        <Button onClick={handleSave} className="w-full py-6 text-base">
          Salva evento
        </Button>
      </div>
    </div>
  );
}
