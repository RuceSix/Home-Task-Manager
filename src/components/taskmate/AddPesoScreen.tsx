import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddPesoScreenProps {
  onBack: () => void;
  onSave: (weight: number, note?: string) => void;
}

export function AddPesoScreen({ onBack, onSave }: AddPesoScreenProps) {
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');

  const handleSave = () => {
    const kg = parseFloat(weight.replace(',', '.'));
    if (!isNaN(kg) && kg > 0) onSave(kg, note || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Peso</h1>
      </header>
      <div className="flex-1 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Peso (kg)</label>
          <input
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/[^0-9,.]/g, ''))}
            placeholder="3.5"
            className="input-styled w-full text-2xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
