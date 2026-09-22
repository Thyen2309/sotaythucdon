import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GroceryItem from '../components/GroceryItem.jsx';
import { CATEGORY_LABELS } from '../data/constants';
import { getGroceryChecks, getMealPlan, getRecipes, saveGroceryChecks } from '../services/storage';
import { buildGroceryList } from '../utils/grocery';

const CATEGORY_ICONS = {
  Thịt: '🥩',
  Rau: '🥦',
  'Gia vị': '🧂',
  'Tinh bột': '🍚',
  Khác: '📦',
};

export default function Grocery() {
  const [dataVersion, setDataVersion] = useState(0);
  const [checks, setChecks] = useState(() => getGroceryChecks());
  const [copied, setCopied] = useState(false);

  // Auto reload when SQL data is synced
  useEffect(() => {
    const handleUpdate = () => {
      setDataVersion((v) => v + 1);
      setChecks(getGroceryChecks());
    };
    window.addEventListener('bepnha_data_updated', handleUpdate);
    return () => window.removeEventListener('bepnha_data_updated', handleUpdate);
  }, []);

  const groups = useMemo(() => {
    const recipes = getRecipes();
    const plan = getMealPlan();
    return buildGroceryList(plan, recipes);
  }, [dataVersion]);

  const toggle = (key) => {
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    saveGroceryChecks(next);
  };

  const allKeys = useMemo(() => {
    return groups.flatMap((group) => group.items.map((item) => item.key));
  }, [groups]);

  const totalItems = allKeys.length;
  const checkedCount = useMemo(() => {
    return allKeys.filter((key) => Boolean(checks[key])).length;
  }, [allKeys, checks]);

  const toggleAll = () => {
    const areAllChecked = checkedCount === totalItems && totalItems > 0;
    const next = {};
    if (!areAllChecked) {
      allKeys.forEach((k) => {
        next[k] = true;
      });
    }
    setChecks(next);
    saveGroceryChecks(next);
  };

  const copyToClipboard = () => {
    if (totalItems === 0) return;

    let text = '🛒 DANH SÁCH ĐI CHỢ • BẾP NHÀ\n\n';
    groups.forEach((group) => {
      const label = CATEGORY_LABELS[group.category] || group.category;
      const icon = CATEGORY_ICONS[group.category] || '📦';
      text += `${icon} ${label.toUpperCase()}:\n`;
      group.items.forEach((item) => {
        const isDone = checks[item.key] ? ' [Đã mua]' : '';
        text += `  • ${item.name}: ${item.quantity} ${item.unit}${isDone}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <section className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">
              Danh sách đi chợ
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink/60">
            Nguyên liệu được tự động tổng hợp và cộng dồn số lượng từ thực đơn tuần đã lên.
          </p>
        </div>

        {totalItems > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-xs sm:text-sm font-semibold text-leaf hover:border-leaf hover:bg-emerald-50/60 transition shadow-xs"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Đã sao chép!' : 'Sao chép gửi Zalo'}</span>
            </button>

            <button
              type="button"
              onClick={toggleAll}
              className="rounded-full bg-sage px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-leaf transition shadow-sm"
            >
              {checkedCount === totalItems ? 'Bỏ chọn tất cả' : 'Đánh dấu tất cả'}
            </button>
          </div>
        )}
      </div>

      {/* Progress & Stats */}
      {totalItems > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/10 text-leaf font-bold text-sm">
              {progressPercent}%
            </div>
            <div>
              <p className="text-sm font-bold text-ink">
                Đã mua xong {checkedCount} / {totalItems} món nguyên liệu
              </p>
              <p className="text-xs text-ink/60">
                {checkedCount === totalItems
                  ? 'Đã mua đủ tất cả nguyên liệu cho tuần này! 🎉'
                  : 'Đánh dấu vào từng ô khi bạn đã nhặt món vào giỏ hàng.'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-60 h-2.5 bg-cream rounded-full overflow-hidden border border-line/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-leaf transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalItems === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-paper p-12 text-center space-y-4 shadow-xs">
          <div className="flex justify-center text-5xl">🧺</div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink">
              Chưa có nguyên liệu nào trong danh sách
            </h2>
            <p className="text-sm text-ink/60 max-w-md mx-auto">
              Thực đơn tuần của bạn hiện đang để trống. Hãy lên lịch các bữa ăn để hệ thống tự động tạo danh sách đi chợ nhé.
            </p>
          </div>
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white hover:bg-leaf transition shadow-sm"
          >
            <span>📅</span>
            <span>Vào trang Lên lịch tuần</span>
          </Link>
        </div>
      ) : (
        /* Categorized Groups Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {groups.map((group) => {
            const label = CATEGORY_LABELS[group.category] || group.category;
            const icon = CATEGORY_ICONS[group.category] || '📦';
            const groupDoneCount = group.items.filter((item) => checks[item.key]).length;

            return (
              <section
                key={group.category}
                className="rounded-3xl border border-line bg-paper p-5 shadow-xs flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-line/70">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-leaf flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cream text-ink/60 border border-line/60">
                    {groupDoneCount}/{group.items.length}
                  </span>
                </div>

                <div className="divide-y divide-line/60 flex-1">
                  {group.items.map((item) => (
                    <GroceryItem
                      key={item.key}
                      item={item}
                      checked={Boolean(checks[item.key])}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

