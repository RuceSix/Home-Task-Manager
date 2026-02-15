import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Crown, Clock, ArrowRight, Mail } from 'lucide-react';
import { HouseMember, HouseInvitation } from '@/types/taskmate';

interface MembersSectionProps {
  members: HouseMember[];
  pendingInvitations: HouseInvitation[];
  isOwner: boolean;
  currentUserId: string;
}

export function MembersSection({ 
  members, 
  pendingInvitations, 
  isOwner,
  currentUserId 
}: MembersSectionProps) {
  const navigate = useNavigate();
  
  const pending = pendingInvitations.filter(inv => inv.status === 'pending');

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Gestione membri e inviti
        </h2>
        <button
          onClick={() => navigate('/members')}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Gestisci
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Members preview */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Membri attivi</span>
          <span className="text-sm font-medium text-foreground">{members.length}</span>
        </div>
        
        {/* Member avatars */}
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member) => {
            const displayName = member.userName || member.userEmail || 'Utente';
            const isCurrentUser = member.userId === currentUserId;
            return (
              <div
                key={member.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-card ${
                  isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                }`}
                title={`${displayName}${member.role === 'owner' ? ' (Proprietario)' : ''}`}
              >
                {member.role === 'owner' ? (
                  <Crown size={16} className={isCurrentUser ? 'text-primary-foreground' : 'text-amber-500'} />
                ) : (
                  <span className={`font-semibold text-sm ${isCurrentUser ? 'text-primary-foreground' : 'text-primary'}`}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            );
          })}
          {members.length > 5 && (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-card">
              <span className="text-xs font-medium text-muted-foreground">+{members.length - 5}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {pending.length} invit{pending.length === 1 ? 'o' : 'i'} in sospeso
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {pending.slice(0, 2).map((inv) => (
          <div key={inv.id} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{inv.invitedEmail}</span>
          </div>
            ))}
            {pending.length > 2 && (
              <p className="text-xs text-muted-foreground">e altri {pending.length - 2}...</p>
            )}
          </div>
        </div>
      )}

      {/* Quick action for owner */}
      {isOwner && (
        <button
          onClick={() => navigate('/members')}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium"
        >
          <UserPlus size={18} />
          Invita nuovo membro
        </button>
      )}

      {!isOwner && (
        <p className="text-sm text-muted-foreground text-center">
          Solo il proprietario può invitare nuovi membri
        </p>
      )}
    </div>
  );
}
