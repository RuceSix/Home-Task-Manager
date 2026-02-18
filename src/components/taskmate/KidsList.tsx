import { useState } from 'react';
import { Baby, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Child } from '@/types/taskmate';
import { AddChildModal } from './AddChildModal';

function getAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const today = new Date();
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  if (months < 1) {
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} giorni`;
  }
  if (months < 12) return `${months} mesi`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} anni`;
  return `${years} anni e ${remainingMonths} mesi`;
}

interface KidsListProps {
  children: Child[];
  onAddChild: (name: string, birthDate: string, childType: 'neonato' | 'bambino', notes: string) => void;
  onUpdateChild: (child: Child) => void;
  onDeleteChild: (childId: string) => void;
}

export function KidsList({
  children,
  onAddChild,
  onUpdateChild,
  onDeleteChild
}: KidsListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="text-sm text-muted-foreground">
          {children.length} {children.length === 1 ? 'bambino' : 'bambini'} nella famiglia
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-2.5 flex items-center gap-2 w-fit"
        >
          <Plus size={20} />
          Aggiungi bambino
        </button>
      </div>

      <div className="space-y-3">
        {children.map((child) => (
          <div
            key={child.id}
            className="task-item task-item-pending animate-slide-up flex items-center gap-4 p-4 rounded-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Baby size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">{child.name}</p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  child.childType === 'neonato' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-primary/20 text-primary'
                }`}>
                  {child.childType === 'neonato' ? 'Neonato' : 'Bambino'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getAge(child.birthDate)} • Nato il {new Date(child.birthDate).toLocaleDateString('it-IT')}
              </p>
              {child.notes && (
                <p className="text-sm text-muted-foreground mt-1 italic">{child.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditingChild(child)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Modifica"
              >
                <Pencil size={18} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Rimuovere ${child.name} dalla lista?`)) {
                    onDeleteChild(child.id);
                  }
                }}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                title="Elimina"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          <Baby size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nessun bambino aggiunto</p>
          <p className="text-sm mb-4">
            Aggiungi neonati e bambini per tenerne traccia in famiglia.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-6 py-2.5 flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Aggiungi bambino
          </button>
        </div>
      )}

      <AddChildModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddChild}
      />

      {editingChild && (
        <EditChildModal
          child={editingChild}
          onClose={() => setEditingChild(null)}
          onSave={(updated) => {
            onUpdateChild(updated);
            setEditingChild(null);
          }}
        />
      )}
    </div>
  );
}

interface EditChildModalProps {
  child: Child;
  onClose: () => void;
  onSave: (child: Child) => void;
}

function EditChildModal({ child, onClose, onSave }: EditChildModalProps) {
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(child.birthDate);
  const [childType, setChildType] = useState<'neonato' | 'bambino'>(child.childType);
  const [notes, setNotes] = useState(child.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
    onSave({
      ...child,
      name: name.trim(),
      birthDate,
      childType,
      notes: notes.trim() || undefined
    });
    setIsLoading(false);
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
            <h2 className="text-xl font-bold text-foreground">Modifica bambino</h2>
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
              className="input-styled w-full"
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
            <label className="block text-sm font-medium text-foreground mb-1">Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="flex-1 btn-primary py-3"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
