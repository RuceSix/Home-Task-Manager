import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Trash2, Crown, Loader2, Mail, Check, Clock, Home, ChevronDown } from 'lucide-react';
import { House, HouseMember, HouseInvitation, User } from '@/types/taskmate';
import { apiCall } from '@/lib/api';
import { storage } from '@/lib/storage';

export default function Members() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [invitations, setInvitations] = useState<HouseInvitation[]>([]);
  const [isHouseDropdownOpen, setIsHouseDropdownOpen] = useState(false);
  const [isLoadingHouses, setIsLoadingHouses] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user and houses on mount
  useEffect(() => {
    const loadUser = async () => {
      const { value } = await storage.get('taskmate-user');
      if (!value) {
        navigate('/');
        return;
      }
      const loadedUser = JSON.parse(value) as User;
      setUser(loadedUser);
      loadHouses(loadedUser.id);
    };
    loadUser();
  }, [navigate]);

  const loadHouses = async (userId: string) => {
    setIsLoadingHouses(true);
    try {
      // Try to load from backend
      const response = await apiCall('getHouses', { userId });
      if (response.success && response.houses && response.houses.length > 0) {
        setHouses(response.houses);
        setSelectedHouse(response.houses[0]);
        return;
      }
      
      // Fallback to local storage if backend returns empty
      const { value } = await storage.get('taskmate-houses');
      if (value) {
        const localHouses = JSON.parse(value) as House[];
        if (localHouses.length > 0) {
          setHouses(localHouses);
          setSelectedHouse(localHouses[0]);
          return;
        }
      }
      
      // If both are empty, set empty state
      if (response.success) {
        setHouses(response.houses || []);
      }
    } catch (err) {
      console.error('Error loading houses:', err);
      // Try local storage on error
      const { value } = await storage.get('taskmate-houses');
      if (value) {
        const localHouses = JSON.parse(value) as House[];
        setHouses(localHouses);
        if (localHouses.length > 0) {
          setSelectedHouse(localHouses[0]);
        }
      }
    } finally {
      setIsLoadingHouses(false);
    }
  };

  // Load members when house changes
  useEffect(() => {
    if (selectedHouse) {
      loadHouseMembers(selectedHouse.id);
    }
  }, [selectedHouse]);

  const loadHouseMembers = async (houseId: string) => {
    setIsLoadingMembers(true);
    setError('');
    
    try {
      const [houseData, invitationsData] = await Promise.all([
        apiCall('getHouseData', { houseId }),
        apiCall('getHouseInvitations', { houseId })
      ]);
      
      if (houseData.success) {
        setMembers(houseData.members || []);
      }
      if (invitationsData.success) {
        setInvitations(invitationsData.invitations || []);
      }
    } catch (err) {
      setError('Errore nel caricamento dei membri');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSelectHouse = (house: House) => {
    setSelectedHouse(house);
    setIsHouseDropdownOpen(false);
    setEmail('');
    setError('');
    setSuccess('');
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse || !user) return;
    
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Inserisci un indirizzo email');
      return;
    }

    // Check if already a member
    if (members.some(m => m.userEmail === email.trim())) {
      setError('Questo utente è già membro della casa');
      return;
    }

    // Check if already invited
    const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
    if (pendingInvitations.some(inv => inv.invitedEmail === email.trim())) {
      setError('Questo utente ha già un invito in sospeso');
      return;
    }

    setIsInviting(true);
    try {
      const response = await apiCall('inviteMember', {
        houseId: selectedHouse.id,
        houseName: selectedHouse.name,
        invitedEmail: email.trim(),
        invitedBy: user.name
      });
      
      if (response.success) {
        setEmail('');
        setSuccess('Invito inviato con successo!');
        await loadHouseMembers(selectedHouse.id);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Errore durante l\'invio dell\'invito');
      }
    } catch (err) {
      setError('Errore durante l\'invio dell\'invito. Riprova.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedHouse || !user || !confirm('Sei sicuro di voler rimuovere questo membro?')) return;
    
    try {
      const response = await apiCall('removeMember', {
        houseId: selectedHouse.id,
        memberId,
        requestedByUserId: user.id
      });
      
      if (response.success) {
        setMembers(members.filter(m => m.id !== memberId));
      } else {
        setError('Errore durante la rimozione');
      }
    } catch (err) {
      setError('Errore durante la rimozione. Riprova.');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await apiCall('cancelInvitation', { invitationId });
      if (response.success) {
        setInvitations(invitations.filter(i => i.id !== invitationId));
      }
    } catch (err) {
      setError('Errore durante l\'annullamento. Riprova.');
    }
  };

  if (!user) return null;

  const isOwner = selectedHouse?.ownerId === user.id;
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gestisci Membri</h1>
                <p className="text-sm text-muted-foreground">Aggiungi o rimuovi membri dalle tue case</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* House Selector */}
        {isLoadingHouses ? (
          <div className="card-elevated p-6 text-center">
            <Loader2 size={32} className="mx-auto text-primary animate-spin mb-2" />
            <p className="text-muted-foreground">Caricamento case...</p>
          </div>
        ) : houses.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Home size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Nessuna casa trovata</h2>
            <p className="text-muted-foreground mb-4">Crea una casa per poter aggiungere membri</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-2"
            >
              Torna alla home
            </button>
          </div>
        ) : (
          <>
            {/* House Dropdown */}
            <div className="card-elevated p-4">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Seleziona una casa
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsHouseDropdownOpen(!isHouseDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Home size={16} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{selectedHouse?.name || 'Seleziona...'}</p>
                      {selectedHouse && (
                        <p className="text-xs text-muted-foreground">
                          {selectedHouse.ownerId === user.id ? 'Proprietario' : 'Membro'}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isHouseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isHouseDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-elegant border border-border z-50 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {houses.map((house) => {
                        const isHouseOwner = house.ownerId === user.id;
                        return (
                          <button
                            key={house.id}
                            onClick={() => handleSelectHouse(house)}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors ${
                              selectedHouse?.id === house.id ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Home size={16} className="text-primary" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-medium text-foreground">{house.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {isHouseOwner ? 'Proprietario' : 'Membro'}
                              </p>
                            </div>
                            {selectedHouse?.id === house.id && (
                              <Check size={16} className="text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            {isLoadingMembers ? (
              <div className="card-elevated p-8 text-center">
                <Loader2 size={32} className="mx-auto text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Caricamento membri...</p>
              </div>
            ) : (
              <>
                {/* Invite Form - Only for owners */}
                {isOwner && (
                  <div className="card-elevated p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <UserPlus size={20} className="text-primary" />
                      Invita un nuovo membro
                    </h2>
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@esempio.it"
                          className="input-styled flex-1"
                        />
                        <button
                          type="submit"
                          disabled={isInviting}
                          className="btn-primary px-6 flex items-center gap-2"
                        >
                          {isInviting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              <UserPlus size={18} />
                              <span className="hidden sm:inline">Invita</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      {error && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                      )}
                      {success && (
                        <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg flex items-center gap-2">
                          <Check size={14} /> {success}
                        </p>
                      )}
                    </form>
                  </div>
                )}

                {!isOwner && selectedHouse && (
                  <div className="card-elevated p-6 text-center">
                    <p className="text-muted-foreground">
                      Solo il proprietario può invitare o rimuovere membri da questa casa
                    </p>
                  </div>
                )}

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div className="card-elevated p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-amber-500" />
                      Inviti in sospeso ({pendingInvitations.length})
                    </h2>
                    <div className="space-y-3">
                      {pendingInvitations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                              <Mail size={18} className="text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{inv.invitedEmail}</p>
                              <p className="text-xs text-muted-foreground">In attesa di risposta</p>
                            </div>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleCancelInvitation(inv.id)}
                              className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                              title="Annulla invito"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="card-elevated p-6">
                  <div className="flex flex-col gap-1 mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Users size={20} className="text-primary" />
                      Membri della casa ({members.length})
                    </h2>
                    {isOwner && (
                      <p className="text-sm text-muted-foreground">
                        Come proprietario puoi rimuovere i membri dalla casa
                      </p>
                    )}
                  </div>
                  {members.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nessun membro in questa casa
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => {
                        const displayName = member.userName || member.userEmail || 'Utente';
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{displayName}</p>
                                  {member.role === 'owner' && (
                                    <Crown size={14} className="text-amber-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{member.userEmail || 'Email non disponibile'}</p>
                              </div>
                            </div>
                            {isOwner && member.userId !== user.id && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium"
                                title="Rimuovi membro dalla casa"
                              >
                                <Trash2 size={16} />
                                <span className="text-sm">Rimuovi</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
