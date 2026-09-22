import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'bepnha_auth_token';
const USER_KEY = 'bepnha_auth_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  // Verify session on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          setSyncStatus('synced');
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Cannot reach auth server:', err);
        // Keep offline cached user
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSyncStatus('idle');
        return { success: false, error: data.error || 'Đăng nhập không thành công' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setSyncStatus('synced');
      return { success: true, user: data.user };
    } catch (err) {
      setSyncStatus('error');
      return { success: false, error: 'Không thể kết nối tới máy chủ cơ sở dữ liệu' };
    }
  };

  const register = async (username, password, displayName) => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSyncStatus('idle');
        return { success: false, error: data.error || 'Đăng ký không thành công' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setSyncStatus('synced');
      return { success: true, user: data.user };
    } catch (err) {
      setSyncStatus('error');
      return { success: false, error: 'Không thể kết nối tới máy chủ cơ sở dữ liệu' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSyncStatus('idle');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoggedIn: Boolean(user),
        isAuthLoading,
        syncStatus,
        setSyncStatus,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
