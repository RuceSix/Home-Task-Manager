import { useState, useMemo } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface AddSonnoScreenProps {
  onBack: () => void;
  onSave: (startTime: string, endTime: string, quality: number, note: string) => void;
}

export function AddSonnoScreen({ onBack, onSave }: AddSonnoScreenProps) {
  const now = new Date();
  const defaultStart = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const defaultEnd = (() => {
    const d = new Date(now);
    d.setHours(d.getHours() + 1);
    d.setMinutes(10);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  })();

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [quality, setQuality] = useState(0);
  const [note, setNote] = useState('');

  const duration = useMemo(() => formatDuration(startTime, endTime), [startTime, endTime]);

  const handleSave = () => {
    onSave(startTime, endTime, quality, note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Sonno</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="card-elevated p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Inizio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-styled w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fine</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-styled w-full"
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10">
            <Clock size={20} className="text-primary" />
            <span className="font-semibold">Durata stimata: {duration}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Qualità (opzionale)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setQuality(n)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
                  quality >= n ? 'bg-amber-500/20 text-amber-600' : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="..."
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
