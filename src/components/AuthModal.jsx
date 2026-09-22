import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp!');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải chứa ít nhất 6 ký tự!');
        return;
      }

      setIsLoading(true);
      const res = await register(username, password, displayName || username);
      setIsLoading(false);

      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    } else {
      setIsLoading(true);
      const res = await login(username, password);
      setIsLoading(false);

      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-paper shadow-2xl border border-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decor */}
        <div className="bg-gradient-to-r from-sage via-leaf to-sage p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            ✕
          </button>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-3xl shadow-inner mb-3">
            🍲
          </div>
          <h2 className="text-xl font-bold font-display">Tài khoản Bếp Nhà</h2>
          <p className="text-xs text-cream/90 mt-1 max-w-xs mx-auto">
            Đồng bộ thực đơn và danh sách đi chợ vào CSDL SQL, không lo mất dữ liệu khi đổi máy.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-line bg-cream/40 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all ${
              tab === 'login'
                ? 'bg-white text-leaf shadow-xs'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all ${
              tab === 'register'
                ? 'bg-white text-leaf shadow-xs'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            Tạo tài khoản mới
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Tên hiển thị (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Bếp Chú Bình, Mẹ Bon..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-2xl border border-line bg-cream/50 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-leaf focus:bg-white transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Nhập username (viết liền không dấu)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-line bg-cream/50 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-leaf focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Tối thiểu 6 ký tự..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-line bg-cream/50 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-leaf focus:bg-white transition"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu để xác nhận..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-line bg-cream/50 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-leaf focus:bg-white transition"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-sage py-3 text-sm font-bold text-white hover:bg-leaf transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>Đang xử lý với CSDL SQL...</span>
                </>
              ) : tab === 'register' ? (
                'Đăng ký tài khoản SQL'
              ) : (
                'Đăng nhập ngay'
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            {tab === 'login' ? (
              <p className="text-xs text-ink/60">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError('');
                  }}
                  className="font-bold text-leaf hover:underline"
                >
                  Đăng ký miễn phí
                </button>
              </p>
            ) : (
              <p className="text-xs text-ink/60">
                Đã có tài khoản trước đó?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError('');
                  }}
                  className="font-bold text-leaf hover:underline"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
