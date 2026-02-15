import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { HouseMember } from '@/types/taskmate';

interface AssigneeSelectorProps {
  members: HouseMember[];
  selectedMemberId: string;
  onSelect: (memberId: string, memberName: string) => void;
}

export function AssigneeSelector({ members, selectedMemberId, onSelect }: AssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMember = members.find(m => m.userId === selectedMemberId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors min-w-[140px]"
      >
        <User size={14} className="text-muted-foreground" />
        <span className="flex-1 text-left truncate text-foreground">
          {selectedMember?.userName || 'Assegna a...'}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full bg-card rounded-lg shadow-lg border border-border z-20 overflow-hidden animate-fade-in">
            {members.map((member) => {
              const displayName = member.userName || member.userEmail || 'Utente';
              return (
                <button
                  key={member.userId || member.id}
                  type="button"
                  onClick={() => {
                    onSelect(member.userId, displayName);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary/50 transition-colors ${
                    member.userId === selectedMemberId ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate text-foreground">{displayName}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
