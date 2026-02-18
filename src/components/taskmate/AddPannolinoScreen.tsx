import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSISTENZE = ['Liquida', 'Normale', 'Dura'] as const;
const COLORI = ['Marrone', 'Giallo', 'Verde', 'Nero', 'Altro'] as const;

interface AddPannolinoScreenProps {
  onBack: () => void;
  onSave: (tipo: 'pipi' | 'cacca' | 'entrambi', consistenza?: string, colore?: string, eventTime?: string, note?: string) => void;
}

export function AddPannolinoScreen({ onBack, onSave }: AddPannolinoScreenProps) {
  const [tipo, setTipo] = useState<'pipi' | 'cacca' | 'entrambi'>('pipi');
  const [consistenza, setConsistenza] = useState<string>('');
  const [colore, setColore] = useState<string>('');
  const [eventTime, setEventTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave(tipo, consistenza || undefined, colore || undefined, eventTime, note || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Pannolino</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="card-elevated p-6 rounded-2xl">
          <label className="block text-sm font-medium mb-3">Tipo</label>
          <div className="flex gap-2 flex-wrap">
            {(['pipi', 'cacca', 'entrambi'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl font-medium transition-colors ${
                  tipo === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                {t === 'pipi' ? 'Pipì' : t === 'cacca' ? 'Cacca' : 'Entrambi'}
              </button>
            ))}
          </div>
        </div>

        {(tipo === 'cacca' || tipo === 'entrambi') && (
          <div className="card-elevated p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Consistenza</label>
              <div className="flex gap-2">
                {CONSISTENZE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setConsistenza(c)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                      consistenza === c ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Colore</label>
              <select
                value={colore}
                onChange={(e) => setColore(e.target.value)}
                className="input-styled w-full"
              >
                <option value="">Seleziona</option>
                {COLORI.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

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
