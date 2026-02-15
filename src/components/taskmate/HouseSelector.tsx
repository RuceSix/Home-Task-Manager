import { useState } from 'react';
import { Home, ChevronDown, Plus, Settings, Users } from 'lucide-react';
import { House } from '@/types/taskmate';

interface HouseSelectorProps {
  houses: House[];
  currentHouse: House | null;
  onSelectHouse: (house: House) => void;
  onCreateHouse: () => void;
  onManageHouse: () => void;
}

export function HouseSelector({
  houses,
  currentHouse,
  onSelectHouse,
  onCreateHouse,
  onManageHouse
}: HouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <Home size={18} className="text-primary" />
        <span className="font-medium text-foreground">
          {currentHouse?.name || 'Seleziona casa'}
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-elegant border border-border z-20 overflow-hidden animate-fade-in">
            {/* Houses list */}
            <div className="max-h-48 overflow-y-auto">
              {houses.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Nessuna casa. Creane una!
                </div>
              ) : (
                houses.map((house) => (
                  <button
                    key={house.id}
                    onClick={() => {
                      onSelectHouse(house);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors ${
                      currentHouse?.id === house.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentHouse?.id === house.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <Home size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{house.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Casa condivisa
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border">
              <button
                onClick={() => {
                  onCreateHouse();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus size={16} className="text-primary" />
                </div>
                <span className="font-medium text-primary">Crea nuova casa</span>
              </button>
              
              {currentHouse && (
                <button
                  onClick={() => {
                    onManageHouse();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-t border-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Users size={16} className="text-secondary-foreground" />
                  </div>
                  <span className="font-medium text-foreground">Gestisci membri</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
