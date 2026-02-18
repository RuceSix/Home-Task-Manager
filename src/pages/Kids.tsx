import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Baby,
  BarChart3,
  Bell,
  ChevronDown,
  Droplets,
  Home,
  Loader2,
  MessageCircle,
  Milk,
  Moon,
  Plus,
  Scale,
  Settings2,
  User
} from 'lucide-react';
import { House as HouseType, Child, ChildEvent, ChildEventType, User as UserType } from '@/types/taskmate';
import { apiCall } from '@/lib/api';
import { storage } from '@/lib/storage';
import { KidsList } from '@/components/taskmate/KidsList';
import { AddChildModal } from '@/components/taskmate/AddChildModal';
import { AddEventBottomSheet } from '@/components/taskmate/AddEventBottomSheet';
import { AddLatteScreen } from '@/components/taskmate/AddLatteScreen';
import { AddAllattamentoScreen } from '@/components/taskmate/AddAllattamentoScreen';
import { AddSonnoScreen } from '@/components/taskmate/AddSonnoScreen';
import { AddPannolinoScreen } from '@/components/taskmate/AddPannolinoScreen';
import { AddPesoScreen } from '@/components/taskmate/AddPesoScreen';
import { AddNotaScreen } from '@/components/taskmate/AddNotaScreen';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatEventForTimeline(e: ChildEvent): string {
  if (e.eventType === 'latte') return `${e.quantity} ml`;
  if (e.eventType === 'allattamento') return e.durationMinutes ? formatDuration(e.durationMinutes) : '';
  if (e.eventType === 'sonno') return e.durationMinutes ? formatDuration(e.durationMinutes) : '';
  if (e.eventType === 'pannolino') return (e.note || '').startsWith('cacca') ? 'Cacca' : (e.note || '').startsWith('entrambi') ? 'Pipì + Cacca' : 'Pipì';
  if (e.eventType === 'peso') return `${e.quantity} kg`;
  if (e.eventType === 'nota') return e.note || '';
  return '';
}

function getEventIcon(type: ChildEventType) {
  const icons: Record<ChildEventType, string> = {
    latte: '🍼', allattamento: '🤱', sonno: '😴', pannolino: '💩', peso: '⚖️', nota: '🩺'
  };
  return icons[type] || '•';
}

function getEventLabel(type: ChildEventType): string {
  const labels: Record<ChildEventType, string> = {
    latte: 'Latte', allattamento: 'Allattamento', sonno: 'Sonno', pannolino: 'Pannolino', peso: 'Peso', nota: 'Nota'
  };
  return labels[type] || '';
}

export default function Kids() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [houses, setHouses] = useState<HouseType[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<HouseType | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [events, setEvents] = useState<ChildEvent[]>([]);
  const [showKidsList, setShowKidsList] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [addEventSheetOpen, setAddEventSheetOpen] = useState(false);
  const [addScreenType, setAddScreenType] = useState<ChildEventType | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'coach' | 'profilo'>('home');
  const [isLoadingHouses, setIsLoadingHouses] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadUser = async () => {
      const { value } = await storage.get('taskmate-user');
      if (!value) {
        navigate('/');
        return;
      }
      const loadedUser = JSON.parse(value) as UserType;
      setUser(loadedUser);
      loadHouses(loadedUser.id);
    };
    loadUser();
  }, [navigate]);

  const loadHouses = async (userId: string) => {
    setIsLoadingHouses(true);
    try {
      const response = await apiCall('getHouses', { userId });
      if (response.success && response.houses?.length) {
        setHouses(response.houses);
        setSelectedHouse(response.houses[0]);
        return;
      }
      const { value } = await storage.get('taskmate-houses');
      if (value) {
        const local = JSON.parse(value) as HouseType[];
        if (local.length) {
          setHouses(local);
          setSelectedHouse(local[0]);
        }
      }
    } catch (err) {
      const { value } = await storage.get('taskmate-houses');
      if (value) {
        const local = JSON.parse(value) as HouseType[];
        setHouses(local);
        if (local.length) setSelectedHouse(local[0]);
      }
    } finally {
      setIsLoadingHouses(false);
    }
  };

  const loadHouseChildren = useCallback(async (houseId: string) => {
    setIsLoadingChildren(true);
    try {
      if (navigator.onLine) {
        const result = await apiCall('getHouseData', { houseId });
        if (result.success && result.children) {
          setChildren(result.children);
          await storage.set(`taskmate-children-${houseId}`, JSON.stringify(result.children));
          setSelectedChild(result.children[0] || null);
          setIsLoadingChildren(false);
          return;
        }
      }
      const { value } = await storage.get(`taskmate-children-${houseId}`);
      const list = value ? JSON.parse(value) : [];
      setChildren(list);
      setSelectedChild(list[0] || null);
    } catch (err) {
      setChildren([]);
      setSelectedChild(null);
    } finally {
      setIsLoadingChildren(false);
    }
  }, []);

  const loadChildEvents = useCallback(async (childId: string) => {
    if (!childId) return;
    setIsLoadingEvents(true);
    try {
      if (navigator.onLine) {
        const result = await apiCall('getChildEvents', { childId, date: today });
        if (result.success && result.childEvents) {
          setEvents(result.childEvents);
          setIsLoadingEvents(false);
          return;
        }
      }
      const { value } = await storage.get(`taskmate-events-${childId}-${today}`);
      setEvents(value ? JSON.parse(value) : []);
    } catch (err) {
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [today]);

  useEffect(() => {
    if (selectedHouse) loadHouseChildren(selectedHouse.id);
  }, [selectedHouse, loadHouseChildren]);

  useEffect(() => {
    if (selectedChild) loadChildEvents(selectedChild.id);
  }, [selectedChild, loadChildEvents]);

  const handleAddChild = async (name: string, birthDate: string, childType: 'neonato' | 'bambino', notes: string) => {
    if (!selectedHouse || !user) return;
    const result = await apiCall('addChild', {
      houseId: selectedHouse.id,
      name,
      birthDate,
      childType,
      notes: notes || undefined,
      createdById: user.id
    });
    if (result.success && result.child) {
      const updated = [...children, result.child];
      setChildren(updated);
      setSelectedChild(result.child);
      await storage.set(`taskmate-children-${selectedHouse.id}`, JSON.stringify(updated));
      setShowAddChild(false);
    }
  };

  const handleUpdateChild = async (child: Child) => {
    if (!selectedHouse) return;
    const result = await apiCall('updateChild', {
      childId: child.id,
      houseId: selectedHouse.id,
      name: child.name,
      birthDate: child.birthDate,
      childType: child.childType,
      notes: child.notes
    });
    if (result.success) {
      const updated = children.map((c) => (c.id === child.id ? child : c));
      setChildren(updated);
      setSelectedChild(child);
      await storage.set(`taskmate-children-${selectedHouse.id}`, JSON.stringify(updated));
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!selectedHouse) return;
    const result = await apiCall('deleteChild', { childId, houseId: selectedHouse.id });
    if (result.success) {
      const updated = children.filter((c) => c.id !== childId);
      setChildren(updated);
      setSelectedChild(updated[0] || null);
      await storage.set(`taskmate-children-${selectedHouse.id}`, JSON.stringify(updated));
    }
  };

  const saveEventAndClose = (payload: { eventType: ChildEventType; quantity?: number; durationMinutes?: number; note?: string }) => {
    if (!selectedChild || !selectedHouse || !user) return;
    apiCall('addChildEvent', {
      childId: selectedChild.id,
      houseId: selectedHouse.id,
      eventType: payload.eventType,
      quantity: payload.quantity,
      durationMinutes: payload.durationMinutes,
      note: payload.note,
      createdById: user.id
    }).then((result) => {
      if (result.success && result.childEvent) {
        const updated = [result.childEvent, ...events];
        setEvents(updated);
        storage.set(`taskmate-events-${selectedChild.id}-${today}`, JSON.stringify(updated));
        setAddScreenType(null);
      }
    });
  };

  const handleAddLatte = (quantity: number, _eventTime: string, note: string) => {
    saveEventAndClose({ eventType: 'latte', quantity, note: note || undefined });
  };
  const handleAddAllattamento = (durationMinutes: number, _eventTime: string, note: string) => {
    saveEventAndClose({ eventType: 'allattamento', durationMinutes, note: note || undefined });
  };
  const handleAddSonno = (startTime: string, endTime: string, _quality: number, note: string) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    saveEventAndClose({ eventType: 'sonno', durationMinutes: mins, note: note || undefined });
  };
  const handleAddPannolino = (tipo: 'pipi' | 'cacca' | 'entrambi', consistenza?: string, colore?: string, _eventTime?: string, note?: string) => {
    let n = tipo;
    if ((tipo === 'cacca' || tipo === 'entrambi') && (consistenza || colore)) {
      n += `|${consistenza || ''}|${colore || ''}`;
    }
    saveEventAndClose({ eventType: 'pannolino', note: n });
  };
  const handleAddPeso = (weight: number, note?: string) => {
    saveEventAndClose({ eventType: 'peso', quantity: weight, note });
  };
  const handleAddNota = (text: string) => {
    saveEventAndClose({ eventType: 'nota', note: text });
  };

  const todayLatte = events.filter((e) => e.eventType === 'latte').reduce((s, e) => s + (e.quantity || 0), 0);
  const todayAllattamento = events.filter((e) => e.eventType === 'allattamento').reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const todaySonno = events.filter((e) => e.eventType === 'sonno').reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const todayPannolini = events.filter((e) => e.eventType === 'pannolino').length;
  const lastEvent = events[0];

  const lastEventText = lastEvent
    ? `${getEventLabel(lastEvent.eventType)} ${formatEventForTimeline(lastEvent)} - ${new Date(lastEvent.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
    : 'Nessun evento oggi';

  if (!user) return null;

  const dateStr = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    weekday: 'short'
  });

  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
            <button
              onClick={() => setShowKidsList(true)}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
              title="Gestisci bambini"
            >
              <Settings2 size={24} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {isLoadingHouses ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : houses.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Baby size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Nessuna casa trovata</h2>
            <p className="text-muted-foreground mb-4">Crea una casa in TaskMate per iniziare</p>
            <button onClick={() => navigate('/')} className="btn-primary px-6 py-2">
              Torna alla home
            </button>
          </div>
        ) : children.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Baby size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Nessun bambino</h2>
            <p className="text-muted-foreground mb-4">Aggiungi un neonato o bambino per iniziare</p>
            <button onClick={() => setShowAddChild(true)} className="btn-primary px-6 py-2">
              Aggiungi bambino
            </button>
          </div>
        ) : (
          <>
            {/* Child header: 👶 Nome + 🔔 + data */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👶</span>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      {children.length > 1 ? (
                        <select
                          value={selectedChild?.id}
                          onChange={(e) => setSelectedChild(children.find((c) => c.id === e.target.value) || null)}
                          className="bg-transparent font-bold text-xl border-none focus:ring-0 cursor-pointer appearance-none pr-2"
                        >
                          {children.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        selectedChild?.name
                      )}
                    </h1>
                    <p className="text-sm text-muted-foreground">{dateStr}</p>
                  </div>
                </div>
                <button className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                  <Bell size={24} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Home tab: Oggi + Timeline */}
            {activeTab === 'home' && (
              <>
            {/* Card Oggi */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Oggi</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-xl bg-primary/5">
                  <span className="text-2xl block mb-1">🍼</span>
                  <p className="font-semibold text-foreground">{todayLatte + (todayAllattamento > 0 ? Math.round(todayAllattamento * 3) : 0)} ml</p>
                  <p className="text-xs text-muted-foreground">Latte</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-primary/5">
                  <span className="text-2xl block mb-1">😴</span>
                  <p className="font-semibold text-foreground">{formatDuration(todaySonno)}</p>
                  <p className="text-xs text-muted-foreground">Sonno</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-primary/5">
                  <span className="text-2xl block mb-1">💩</span>
                  <p className="font-semibold text-foreground">{todayPannolini}</p>
                  <p className="text-xs text-muted-foreground">Pannolini</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Ultimo evento: {lastEventText}</p>
            </div>


            {/* Card Timeline */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Timeline</h2>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {isLoadingEvents ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nessun evento oggi</p>
                ) : (
                  events.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-muted-foreground w-12 shrink-0">
                        {new Date(e.createdAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-lg">{getEventIcon(e.eventType)}</span>
                      <span className="font-medium">{getEventLabel(e.eventType)}</span>
                      <span className="text-muted-foreground ml-auto">
                        {formatEventForTimeline(e)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
              </>
            )}

            {/* Tab content - Stats, Coach, Profilo */}
            {activeTab === 'stats' && (
              <div className="space-y-6 mt-6">
                <div className="card-elevated p-6">
                  <h2 className="text-lg font-semibold mb-4">📈 Statistiche</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/5">
                      <p className="text-sm text-muted-foreground">Latte totale oggi</p>
                      <p className="text-2xl font-bold">{todayLatte + (todayAllattamento > 0 ? Math.round(todayAllattamento * 3) : 0)} ml</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5">
                      <p className="text-sm text-muted-foreground">Sonno totale oggi</p>
                      <p className="text-2xl font-bold">{formatDuration(todaySonno)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5">
                      <p className="text-sm text-muted-foreground">Pannolini oggi</p>
                      <p className="text-2xl font-bold">{todayPannolini}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Tab Oggi | Settimana | Mese (in sviluppo)</p>
                </div>
              </div>
            )}
            {activeTab === 'coach' && (
              <div className="card-elevated p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">🧠 Baby Coach</h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-primary/10 max-w-[80%]">
                    <p className="text-sm">Ciao! Dimmi cosa succede oggi 😊</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Funzionalità in sviluppo. Non sostituisce il pediatra.</p>
                </div>
              </div>
            )}
            {activeTab === 'profilo' && selectedChild && (
              <div className="space-y-6 mt-6">
                <div className="card-elevated p-6">
                  <h2 className="text-lg font-semibold mb-4">👶 Profilo</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedChild.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data di nascita</p>
                      <p className="font-medium">{new Date(selectedChild.birthDate).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowKidsList(true)} className="w-full py-3 rounded-xl bg-secondary font-medium">
                  Cambia bambino
                </button>
                <button onClick={() => setShowAddChild(true)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium">
                  Aggiungi bambino
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      {selectedChild && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-pb">
          <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Home size={24} className={activeTab === 'home' ? 'fill-current' : ''} />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'stats' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <BarChart3 size={24} className={activeTab === 'stats' ? 'fill-current' : ''} />
              <span className="text-xs">Stats</span>
            </button>
            <AddEventBottomSheet
              open={addEventSheetOpen}
              onOpenChange={setAddEventSheetOpen}
              onSelectType={(t) => setAddScreenType(t)}
              trigger={
                <button className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                  <Plus size={28} />
                </button>
              }
            />
            <button
              onClick={() => setActiveTab('coach')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'coach' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <MessageCircle size={24} className={activeTab === 'coach' ? 'fill-current' : ''} />
              <span className="text-xs">Coach</span>
            </button>
            <button
              onClick={() => setActiveTab('profilo')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profilo' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <User size={24} className={activeTab === 'profilo' ? 'fill-current' : ''} />
              <span className="text-xs">Profilo</span>
            </button>
          </div>
        </nav>
      )}

      {/* Add Event Full Screens */}
      {addScreenType === 'latte' && (
        <AddLatteScreen onBack={() => setAddScreenType(null)} onSave={handleAddLatte} />
      )}
      {addScreenType === 'allattamento' && (
        <AddAllattamentoScreen onBack={() => setAddScreenType(null)} onSave={handleAddAllattamento} />
      )}
      {addScreenType === 'sonno' && (
        <AddSonnoScreen onBack={() => setAddScreenType(null)} onSave={handleAddSonno} />
      )}
      {addScreenType === 'pannolino' && (
        <AddPannolinoScreen onBack={() => setAddScreenType(null)} onSave={handleAddPannolino} />
      )}
      {addScreenType === 'peso' && (
        <AddPesoScreen onBack={() => setAddScreenType(null)} onSave={handleAddPeso} />
      )}
      {addScreenType === 'nota' && (
        <AddNotaScreen onBack={() => setAddScreenType(null)} onSave={handleAddNota} />
      )}

      {/* Modals */}
      {showKidsList && selectedHouse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30">
          <div className="min-h-screen p-4">
            <div className="max-w-2xl mx-auto bg-card rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Gestisci bambini</h2>
                <button
                  onClick={() => setShowKidsList(false)}
                  className="p-2 rounded-lg hover:bg-secondary font-medium"
                >
                  Chiudi
                </button>
              </div>
              <KidsList
                children={children}
                onAddChild={handleAddChild}
                onUpdateChild={handleUpdateChild}
                onDeleteChild={handleDeleteChild}
              />
            </div>
          </div>
        </div>
      )}

      <AddChildModal
        isOpen={showAddChild}
        onClose={() => setShowAddChild(false)}
        onAdd={handleAddChild}
      />

    </div>
  );
}
