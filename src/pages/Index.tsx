import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/taskmate/AuthForm';
import { Header } from '@/components/taskmate/Header';
import { TabBar } from '@/components/taskmate/TabBar';
import { TaskList } from '@/components/taskmate/TaskList';
import { ShoppingList } from '@/components/taskmate/ShoppingList';
import { StatsCards } from '@/components/taskmate/StatsCards';
import { CreateHouseModal } from '@/components/taskmate/CreateHouseModal';
import { CompletedTasksModal } from '@/components/taskmate/CompletedTasksModal';
import { CompletedShoppingModal } from '@/components/taskmate/CompletedShoppingModal';
import { PendingInvitationsBar } from '@/components/taskmate/PendingInvitationsBar';
import { apiCall } from '@/lib/api';
import { storage } from '@/lib/storage';
import { User, Task, ShoppingItem, House, HouseMember, HouseInvitation } from '@/types/taskmate';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // House state
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<HouseInvitation[]>([]);
  const [houseInvitations, setHouseInvitations] = useState<HouseInvitation[]>([]);

  // Modals
  const [showCreateHouseModal, setShowCreateHouseModal] = useState(false);
  const [showCompletedTasksModal, setShowCompletedTasksModal] = useState(false);
  const [showCompletedShoppingModal, setShowCompletedShoppingModal] = useState(false);

  // App state
  const [activeTab, setActiveTab] = useState<'tasks' | 'shopping'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Load houses for user (userEmail opzionale: utile dopo login quando currentUser non è ancora aggiornato)
  const loadHouses = useCallback(async (userId: string, userEmail?: string) => {
    try {
      if (navigator.onLine) {
        const result = await apiCall('getHouses', { userId });
        if (result.success) {
          const houseList = result.houses || [];
          setHouses(houseList);
          await storage.set('taskmate-houses', JSON.stringify(houseList));

          const email = userEmail ?? currentUser?.email;
          if (email) {
            const invResult = await apiCall('getPendingInvitations', { email });
            if (invResult.success) {
              setPendingInvitations(invResult.invitations || []);
            }
          }

          return houseList;
        }
      }

      const housesResult = await storage.get('taskmate-houses');
      const savedHouses = housesResult.value ? JSON.parse(housesResult.value) : [];
      setHouses(savedHouses);
      return savedHouses;
    } catch (error) {
      console.error('Error loading houses:', error);
      return [];
    }
  }, [currentUser?.email]);

  // Load house data (tasks, shopping, members)
  const loadHouseData = useCallback(async (houseId: string) => {
    try {
      setSyncStatus('Caricamento...');

      if (navigator.onLine) {
        const result = await apiCall('getHouseData', { houseId });
        if (result.success) {
          setTasks(result.tasks || []);
          setShopping(result.shopping || []);
          setMembers(result.members || []);
          
          // Load house invitations
          const invResult = await apiCall('getHouseInvitations', { houseId });
          if (invResult.success) {
            setHouseInvitations(invResult.invitations || []);
          }

          await storage.set(`taskmate-tasks-${houseId}`, JSON.stringify(result.tasks || []));
          await storage.set(`taskmate-shopping-${houseId}`, JSON.stringify(result.shopping || []));
          await storage.set(`taskmate-members-${houseId}`, JSON.stringify(result.members || []));
          
          setSyncStatus('✓ Sincronizzato');
          setTimeout(() => setSyncStatus(''), 2000);
          return;
        }
      }

      // Fallback to local storage
      const tasksResult = await storage.get(`taskmate-tasks-${houseId}`);
      const shoppingResult = await storage.get(`taskmate-shopping-${houseId}`);
      const membersResult = await storage.get(`taskmate-members-${houseId}`);

      setTasks(tasksResult.value ? JSON.parse(tasksResult.value) : []);
      setShopping(shoppingResult.value ? JSON.parse(shoppingResult.value) : []);
      setMembers(membersResult.value ? JSON.parse(membersResult.value) : []);

      setSyncStatus('Offline');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('Error loading house data:', error);
      setSyncStatus('Errore');
      setTimeout(() => setSyncStatus(''), 2000);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userResult = await storage.get('taskmate-user');
        if (userResult.value) {
          const user = JSON.parse(userResult.value) as User;
          setCurrentUser(user);
          setIsAuthenticated(true);

          const userHouses = await loadHouses(user.id, user.email);
          
          // Try to load last selected house
          const lastHouseResult = await storage.get('taskmate-current-house');
          if (lastHouseResult.value) {
            const lastHouse = JSON.parse(lastHouseResult.value) as House;
            const stillExists = userHouses.find((h: House) => h.id === lastHouse.id);
            if (stillExists) {
              setCurrentHouse(stillExists);
              await loadHouseData(stillExists.id);
            } else if (userHouses.length > 0) {
              setCurrentHouse(userHouses[0]);
              await loadHouseData(userHouses[0].id);
            }
          } else if (userHouses.length > 0) {
            setCurrentHouse(userHouses[0]);
            await loadHouseData(userHouses[0].id);
          }
        }
      } catch (error) {
        console.log('No authenticated user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadHouses, loadHouseData]);

  // Online/offline and install prompt listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync to backend helper
  const syncToBackend = async (type: string, data: Task[] | ShoppingItem[]) => {
    if (!isOnline || !currentUser || !currentHouse) return;

    try {
      await apiCall('syncHouseData', {
        houseId: currentHouse.id,
        type,
        data
      });
      setSyncStatus('✓ Salvato');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Auth handlers
  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    const userHouses = await loadHouses(user.id, user.email);

    if (userHouses.length > 0) {
      setCurrentHouse(userHouses[0]);
      await storage.set('taskmate-current-house', JSON.stringify(userHouses[0]));
      await loadHouseData(userHouses[0].id);
    }
  };

  const handleLogout = async () => {
    await storage.delete('taskmate-user');
    await storage.delete('taskmate-houses');
    await storage.delete('taskmate-current-house');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setHouses([]);
    setCurrentHouse(null);
    setTasks([]);
    setShopping([]);
    setMembers([]);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  // House handlers
  const handleSelectHouse = async (house: House) => {
    setCurrentHouse(house);
    await storage.set('taskmate-current-house', JSON.stringify(house));
    await loadHouseData(house.id);
  };

  const handleCreateHouse = async (name: string) => {
    if (!currentUser) return;

    const result = await apiCall('createHouse', {
      name,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerEmail: currentUser.email
    });

    if (result.success && result.house) {
      const newHouses = [...houses, result.house];
      setHouses(newHouses);
      await storage.set('taskmate-houses', JSON.stringify(newHouses));
      
      setCurrentHouse(result.house);
      await storage.set('taskmate-current-house', JSON.stringify(result.house));
      
      // Set initial member (owner)
      setMembers([{
        id: `${result.house.id}-${currentUser.id}`,
        houseId: result.house.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        role: 'owner',
        joinedAt: new Date().toISOString()
      }]);
      setTasks([]);
      setShopping([]);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!currentUser) return;

    const result = await apiCall('acceptInvitation', {
      invitationId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email
    });

    if (result.success) {
      setPendingInvitations(pendingInvitations.filter(i => i.id !== invitationId));
      await loadHouses(currentUser.id);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    const result = await apiCall('rejectInvitation', { invitationId });

    if (result.success) {
      setPendingInvitations(pendingInvitations.filter(i => i.id !== invitationId));
    }
  };

  // Task handlers
  const handleAddTask = async (
    title: string,
    assigneeId: string,
    assigneeName: string,
    dueDate?: string,
    category?: string
  ) => {
    if (!currentUser || !currentHouse) return;

    const task: Task = {
      id: Date.now(),
      title,
      assignee: assigneeName,
      assigneeId,
      dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      completed: false,
      category: category || 'generale',
      houseId: currentHouse.id,
      createdBy: currentUser.name,
      createdById: currentUser.id
    };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    await storage.set(`taskmate-tasks-${currentHouse.id}`, JSON.stringify(updatedTasks));
    await syncToBackend('tasks', updatedTasks);
  };

  const handleToggleTask = async (id: number) => {
    if (!currentHouse) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      return {
        ...t,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined
      };
    });
    setTasks(updatedTasks);
    await storage.set(`taskmate-tasks-${currentHouse.id}`, JSON.stringify(updatedTasks));
    await syncToBackend('tasks', updatedTasks);
  };

  const handleDeleteTask = async (id: number) => {
    if (!currentHouse) return;

    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    await storage.set(`taskmate-tasks-${currentHouse.id}`, JSON.stringify(updatedTasks));
    await syncToBackend('tasks', updatedTasks);
  };

  // Shopping handlers
  const handleAddItem = async (
    item: string,
    quantity: number,
    unit: string,
    category: string,
    assigneeId: string,
    assigneeName: string
  ) => {
    if (!currentUser || !currentHouse) return;

    const newItem: ShoppingItem = {
      id: Date.now(),
      item,
      quantity: quantity >= 1 ? quantity : 1,
      unit: unit || 'pezzi',
      checked: false,
      category: category || 'Altro',
      houseId: currentHouse.id,
      addedBy: currentUser.name,
      addedById: currentUser.id,
      assigneeId: assigneeId || currentUser.id,
      assignee: assigneeName || currentUser.name
    };
    const updatedShopping = [...shopping, newItem];
    setShopping(updatedShopping);
    await storage.set(`taskmate-shopping-${currentHouse.id}`, JSON.stringify(updatedShopping));
    await syncToBackend('shopping', updatedShopping);
  };

  const handleToggleItem = async (id: number) => {
    if (!currentHouse) return;

    const updatedShopping = shopping.map((s) => {
      if (s.id !== id) return s;
      const checked = !s.checked;
      return {
        ...s,
        checked,
        checkedAt: checked ? new Date().toISOString() : undefined
      };
    });
    setShopping(updatedShopping);
    await storage.set(`taskmate-shopping-${currentHouse.id}`, JSON.stringify(updatedShopping));
    await syncToBackend('shopping', updatedShopping);
  };

  const handleDeleteItem = async (id: number) => {
    if (!currentHouse) return;

    const updatedShopping = shopping.filter(s => s.id !== id);
    setShopping(updatedShopping);
    await storage.set(`taskmate-shopping-${currentHouse.id}`, JSON.stringify(updatedShopping));
    await syncToBackend('shopping', updatedShopping);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4" style={{ background: 'var(--gradient-primary)' }} />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Main app
  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto p-4 pb-8">
        <Header
          user={currentUser!}
          isOnline={isOnline}
          syncStatus={syncStatus}
          showInstallButton={showInstallButton}
          houses={houses}
          currentHouse={currentHouse}
          onSelectHouse={handleSelectHouse}
          onCreateHouse={() => setShowCreateHouseModal(true)}
          onManageHouse={() => navigate('/members')}
          onInstall={handleInstall}
          onLogout={handleLogout}
        />

        {/* Pending Invitations */}
        <PendingInvitationsBar
          invitations={pendingInvitations}
          onAccept={handleAcceptInvitation}
          onReject={handleRejectInvitation}
        />

        {/* No house message */}
        {!currentHouse && houses.length === 0 && (
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-primary/10 flex items-center justify-center">
              <span className="text-3xl">🏠</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Nessuna casa</h2>
            <p className="text-muted-foreground mb-6">
              Crea la tua prima casa per iniziare a gestire compiti e spesa con la tua famiglia!
            </p>
            <button
              onClick={() => setShowCreateHouseModal(true)}
              className="btn-primary px-6 py-3"
            >
              Crea la tua prima casa
            </button>
          </div>
        )}

        {/* Main Content Card */}
        {currentHouse && (
          <>
            <div className="card-elevated mb-6 overflow-hidden">
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="p-6">
                {activeTab === 'tasks' ? (
                  <TaskList
                    tasks={tasks}
                    members={members}
                    currentUserId={currentUser?.id || ''}
                    currentUserName={currentUser?.name || ''}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />
                ) : (
                  <ShoppingList
                    items={shopping}
                    members={members}
                    currentUserId={currentUser?.id || ''}
                    currentUserName={currentUser?.name || ''}
                    onAddItem={handleAddItem}
                    onToggleItem={handleToggleItem}
                    onDeleteItem={handleDeleteItem}
                  />
                )}
              </div>
            </div>

            <StatsCards
              tasks={tasks}
              shopping={shopping}
              onCompletedTasksClick={() => setShowCompletedTasksModal(true)}
              onCompletedShoppingClick={() => setShowCompletedShoppingModal(true)}
            />
          </>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>📱 TaskMate PWA - Dati sincronizzati con Supabase</p>
        </div>
      </div>

      {/* Modals */}
      <CreateHouseModal
        isOpen={showCreateHouseModal}
        onClose={() => setShowCreateHouseModal(false)}
        onCreateHouse={handleCreateHouse}
      />

      <CompletedTasksModal
        isOpen={showCompletedTasksModal}
        onClose={() => setShowCompletedTasksModal(false)}
        tasks={tasks}
        showAllMembers
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <CompletedShoppingModal
        isOpen={showCompletedShoppingModal}
        onClose={() => setShowCompletedShoppingModal(false)}
        items={shopping}
        showAllMembers
        onToggleItem={handleToggleItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
