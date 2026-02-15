import { useState } from 'react';
import { Home, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { storage } from '@/lib/storage';
import { User } from '@/types/taskmate';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!loginEmail || !loginPassword) {
      setAuthError('Inserisci email e password');
      setAuthLoading(false);
      return;
    }

    try {
      const result = await apiCall('login', {
        email: loginEmail,
        password: loginPassword
      });

      if (result.success && result.user) {
        await storage.set('taskmate-user', JSON.stringify(result.user));
        onAuthSuccess(result.user);
      } else {
        setAuthError(result.message || 'Credenziali non valide');
      }
    } catch {
      setAuthError('Errore di connessione. Riprova.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!registerName || !registerEmail || !registerPassword) {
      setAuthError('Compila tutti i campi');
      setAuthLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setAuthError('La password deve avere almeno 6 caratteri');
      setAuthLoading(false);
      return;
    }

    try {
      const result = await apiCall('register', {
        name: registerName,
        email: registerEmail,
        password: registerPassword
      });

      if (result.success && result.user) {
        await storage.set('taskmate-user', JSON.stringify(result.user));
        onAuthSuccess(result.user);
      } else {
        setAuthError(result.message || 'Errore durante la registrazione');
      }
    } catch {
      setAuthError('Errore di connessione. Riprova.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="card-elevated w-full max-w-md p-8 animate-scale-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="btn-primary p-3 rounded-xl">
            <Home className="text-primary-foreground" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">TaskMate</h1>
            <p className="text-muted-foreground text-sm">Gestione domestica intelligente</p>
          </div>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 animate-fade-in">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{authError}</span>
          </div>
        )}

        {!showRegister ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6">Accedi</h2>

            <div className="mb-4">
              <label className="block text-foreground text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="input-styled"
                placeholder="la-tua@email.it"
              />
            </div>

            <div className="mb-6">
              <label className="block text-foreground text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input-styled"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full btn-primary py-3 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {authLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setAuthError('');
                }}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Non hai un account? Registrati
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6">Registrati</h2>

            <div className="mb-4">
              <label className="block text-foreground text-sm font-semibold mb-2">
                Nome
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="input-styled"
                placeholder="Il tuo nome"
              />
            </div>

            <div className="mb-4">
              <label className="block text-foreground text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="input-styled"
                placeholder="la-tua@email.it"
              />
            </div>

            <div className="mb-6">
              <label className="block text-foreground text-sm font-semibold mb-2">
                Password (min 6 caratteri)
              </label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="input-styled"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full btn-primary py-3 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={20} />
              {authLoading ? 'Registrazione...' : 'Crea Account'}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setAuthError('');
                }}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Hai già un account? Accedi
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            🔒 I tuoi dati sono al sicuro e sincronizzati nel cloud
          </p>
        </div>
      </div>
    </div>
  );
}
