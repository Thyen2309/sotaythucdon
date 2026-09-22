import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { syncFromSQL } from '../services/storage';

const links = [
  { to: '/', label: 'Thư viện', icon: '🍲' },
  { to: '/planner', label: 'Lên lịch', icon: '📅' },
  { to: '/grocery', label: 'Đi chợ', icon: '🛒' },
];

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with SQL when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      syncFromSQL();
    }
  }, [isLoggedIn]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncFromSQL();
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md transition-all">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf to-sage text-white shadow-md shadow-leaf/20 group-hover:scale-105 transition flex-shrink-0">
              <span className="text-xl">🍲</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-bold font-display tracking-tight text-ink group-hover:text-leaf transition-colors">
                Bếp Nhà
              </span>
              <span className="hidden sm:block text-[11px] text-ink/60 -mt-0.5">
                Thực đơn & Đi chợ thông minh
              </span>
            </div>
          </NavLink>

          {/* Nav Links */}
          <div className="flex items-center gap-1 rounded-full border border-line bg-cream/70 p-1 shadow-inner">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-sage text-white shadow-sm shadow-sage/30'
                      : 'text-ink/70 hover:text-leaf hover:bg-white/60'
                  }`
                }
              >
                <span className="text-xs sm:text-sm">{link.icon}</span>
                <span className="hidden xs:inline">{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Auth & SQL Cloud Status */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-leaf/30 bg-emerald-50/70 py-1.5 pl-2 pr-3 text-xs font-bold text-leaf hover:bg-emerald-100/60 transition shadow-xs"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-[11px] text-white font-bold uppercase">
                    {user.displayName ? user.displayName.charAt(0) : user.username.charAt(0)}
                  </div>
                  <span className="max-w-[90px] sm:max-w-[130px] truncate">
                    {user.displayName || user.username}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded-full border border-emerald-200 hidden sm:inline">
                    SQL ✓
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-xl animate-fadeIn text-xs text-ink z-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-2 border-b border-line/60">
                      <p className="font-bold text-ink truncate">{user.displayName}</p>
                      <p className="text-[11px] text-ink/50 truncate">@{user.username}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Đã kết nối CSDL SQL</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualSync();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-cream transition text-left mt-1"
                    >
                      <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
                      <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lại CSDL SQL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-red-600 hover:bg-red-50 transition text-left mt-1"
                    >
                      <span>🚪</span>
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-sage px-3.5 py-1.5 text-xs font-bold text-white hover:bg-leaf transition shadow-sm"
              >
                <span>🔑</span>
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}


