import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Planner from './pages/Planner.jsx';
import Grocery from './pages/Grocery.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between selection:bg-leaf/20 selection:text-leaf">
      <div>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <footer className="border-t border-line/70 bg-paper/60 py-8 text-center text-xs text-ink/60">
        <div className="mx-auto max-w-6xl px-4 space-y-1.5">
          <p className="flex items-center justify-center gap-2 font-semibold text-leaf">
            <span>🍲</span>
            <span>Bếp Nhà • Sổ Tay Thực Đơn & Đi Chợ</span>
          </p>
          <p className="text-[11px] text-ink/40">
            Kế hoạch bữa ăn gia đình ấm áp, tiện lợi và tiết kiệm thời gian
          </p>
        </div>
      </footer>
    </div>
  );
}

