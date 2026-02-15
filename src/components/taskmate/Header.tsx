import { Home, Wifi, WifiOff, LogOut, Download, Users, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, House } from '@/types/taskmate';
import { HouseSelector } from './HouseSelector';

interface HeaderProps {
  user: User;
  isOnline: boolean;
  syncStatus: string;
  showInstallButton: boolean;
  houses: House[];
  currentHouse: House | null;
  onSelectHouse: (house: House) => void;
  onCreateHouse: () => void;
  onManageHouse: () => void;
  onInstall: () => void;
  onLogout: () => void;
}

export function Header({ 
  user, 
  isOnline, 
  syncStatus, 
  showInstallButton,
  houses,
  currentHouse,
  onSelectHouse,
  onCreateHouse,
  onManageHouse,
  onInstall, 
  onLogout 
}: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4 mb-6">
      {/* Install Banner */}
      {showInstallButton && (
        <div 
          className="rounded-2xl p-4 flex items-center justify-between animate-slide-up"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <div className="flex items-center gap-3 text-primary-foreground">
            <Download size={24} />
            <div>
              <p className="font-semibold">Installa TaskMate</p>
              <p className="text-sm opacity-90">Usa l'app offline e accedi rapidamente</p>
            </div>
          </div>
          <button
            onClick={onInstall}
            className="bg-card text-primary px-4 py-2 rounded-xl font-semibold hover:bg-card/90 transition-colors"
          >
            Installa
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="btn-primary p-3 rounded-xl">
              <Home className="text-primary-foreground" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">TaskMate</h1>
              <p className="text-muted-foreground text-sm">Benvenuto, {user.name}!</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* House Selector */}
            <HouseSelector
              houses={houses}
              currentHouse={currentHouse}
              onSelectHouse={onSelectHouse}
              onCreateHouse={onCreateHouse}
              onManageHouse={onManageHouse}
            />

            {/* Home Hub Link */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors font-medium"
              title="Home Hub"
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Home Hub</span>
            </button>

            {/* Manage Members Link */}
            <button
              onClick={() => navigate('/members')}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors font-medium"
              title="Gestisci membri"
            >
              <Users size={18} />
              <span className="hidden sm:inline">Membri</span>
            </button>

            {/* Sync Status */}
            {syncStatus && (
              <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg animate-fade-in">
                {syncStatus}
              </div>
            )}

            {/* Online Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              isOnline 
                ? 'bg-success/10 text-success' 
                : 'bg-accent/10 text-accent'
            }`}>
              {isOnline ? (
                <>
                  <Wifi size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-xl hover:bg-destructive/20 transition-colors font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
