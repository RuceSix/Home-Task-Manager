import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddNotaScreenProps {
  onBack: () => void;
  onSave: (text: string) => void;
}

export function AddNotaScreen({ onBack, onSave }: AddNotaScreenProps) {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Nota</h1>
      </header>
      <div className="flex-1 p-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrivi una nota..."
          className="input-styled w-full min-h-[200px] resize-none"
        />
      </div>
      <div className="p-4 border-t">
        <Button onClick={() => text.trim() && onSave(text.trim())} className="w-full py-6 text-base" disabled={!text.trim()}>
          Salva nota
        </Button>
      </div>
    </div>
  );
}
