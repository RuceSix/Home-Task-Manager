import { useState, useEffect } from 'react';
import { X, CheckSquare, Loader2, Mic, MicOff } from 'lucide-react';
import { HouseMember } from '@/types/taskmate';
import { AssigneeSelector } from './AssigneeSelector';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseVoiceInput } from '@/utils/voiceParser';

const CATEGORIE_TASK: { value: string; label: string }[] = [
  { value: 'generale', label: 'Generale' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Cucina', label: 'Cucina' },
  { value: 'Lavoro', label: 'Lavoro' },
  { value: 'Bambini', label: 'Bambini' },
  { value: 'Giardino', label: 'Giardino' },
  { value: 'Manutenzione', label: 'Manutenzione' },
  { value: 'Altro', label: 'Altro' }
];

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: HouseMember[];
  currentUserId: string;
  currentUserName: string;
  onAdd: (title: string, assigneeId: string, assigneeName: string, dueDate: string, category: string) => void;
}

export function AddTaskModal({
  isOpen,
  onClose,
  members,
  currentUserId,
  currentUserName,
  onAdd
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<string>(CATEGORIE_TASK[0].value);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(currentUserId);
  const [selectedAssigneeName, setSelectedAssigneeName] = useState(currentUserName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isListening, startListening, stopListening, supported } = useSpeechRecognition({ language: 'it-IT' });

  useEffect(() => {
    if (!isOpen) setError('');
  }, [isOpen]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening((text) => {
      const parsed = parseVoiceInput(text);
      if (parsed && parsed.type === 'task') {
        // Aggiorna sempre tutti i campi quando il parser restituisce un risultato valido
        setTitle(parsed.title);
        if (parsed.dueDate) {
          setDueDate(parsed.dueDate);
        }
        // Aggiorna sempre la categoria, anche se non trovata nel parser
        if (parsed.category) {
          const found = CATEGORIE_TASK.find(c => c.value === parsed.category);
          if (found) {
            setCategory(parsed.category);
          } else {
            // Fallback alla categoria di default se non trovata
            setCategory(CATEGORIE_TASK[0].value);
          }
        } else {
          // Se non c'è categoria nel parser, usa quella di default
          setCategory(CATEGORIE_TASK[0].value);
        }
      } else {
        // Fallback: se non riconosce come task, metti solo il testo
        setTitle(text);
      }
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Inserisci il titolo dell\'attività');
      return;
    }
    setIsLoading(true);
    try {
      onAdd(
        title.trim(),
        selectedAssigneeId,
        selectedAssigneeName,
        dueDate || new Date().toISOString().split('T')[0],
        category || 'generale'
      );
      setTitle('');
      setDueDate(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
      });
      setCategory(CATEGORIE_TASK[0].value);
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
            <CheckSquare size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Nuova attività</h2>
            <p className="text-sm text-muted-foreground">Aggiungi un compito da svolgere</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Attività</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Fare la spesa, Stirare..."
                className="input-styled flex-1"
                autoFocus
              />
              {supported && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title={isListening ? 'Ferma registrazione' : 'Inserisci a voce'}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors ${
                    isListening ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Scadenza</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-styled w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-styled w-full"
            >
              {CATEGORIE_TASK.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
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
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Aggiungi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
