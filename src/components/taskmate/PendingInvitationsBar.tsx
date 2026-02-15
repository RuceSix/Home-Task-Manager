import { Check, X, Home } from 'lucide-react';
import { HouseInvitation } from '@/types/taskmate';

interface PendingInvitationsBarProps {
  invitations: HouseInvitation[];
  onAccept: (invitationId: string) => Promise<void>;
  onReject: (invitationId: string) => Promise<void>;
}

export function PendingInvitationsBar({ invitations, onAccept, onReject }: PendingInvitationsBarProps) {
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="card-elevated p-4 border-2 border-primary/20 animate-fade-in"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Invito a unirsi a "{inv.houseName}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Invitato da {inv.invitedBy}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReject(inv.id)}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
              <button
                onClick={() => onAccept(inv.id)}
                className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
