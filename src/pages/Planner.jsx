import { useMemo, useState, useEffect } from 'react';
import MealSelect from '../components/MealSelect.jsx';
import { DAYS, MEALS, emptyMealPlan, RANDOM_STYLES } from '../data/constants';
import { getMealPlan, getRecipes, saveMealPlan, deleteRecipe } from '../services/storage';
import { fillRandomMeals } from '../utils/randomPlan';

export default function Planner() {
  const [recipes, setRecipes] = useState(() => getRecipes());
  const [plan, setPlan] = useState(() => getMealPlan());
  const [selectedRandomStyle, setSelectedRandomStyle] = useState('smart');
  const [isManageRecipesOpen, setIsManageRecipesOpen] = useState(false);
  const [manageSearch, setManageSearch] = useState('');

  // Auto reload when SQL data is synced
  useEffect(() => {
    const handleUpdate = () => {
      setRecipes(getRecipes());
      setPlan(getMealPlan());
    };
    window.addEventListener('bepnha_data_updated', handleUpdate);
    return () => window.removeEventListener('bepnha_data_updated', handleUpdate);
  }, []);

  const commitPlan = (next) => {
    setPlan(next);
    saveMealPlan(next);
  };

  const updateCell = (dayKey, mealKey, recipeId) => {
    commitPlan({
      ...plan,
      [dayKey]: {
        ...plan[dayKey],
        [mealKey]: recipeId,
      },
    });
  };

  const handleRerollCell = (dayKey, mealKey) => {
    if (!recipes.length) return;
    const currentId = plan[dayKey]?.[mealKey];
    const pool = recipes.filter((r) => r.id !== currentId);
    const candidates = pool.length > 0 ? pool : recipes;
    const picked = candidates[Math.floor(Math.random() * candidates.length)].id;
    updateCell(dayKey, mealKey, picked);
  };

  const handleDeleteRecipe = (recipeId) => {
    const target = recipes.find((r) => r.id === recipeId);
    const name = target ? target.name : 'món này';
    if (
      window.confirm(
        `Bạn có chắc muốn xóa vĩnh viễn món "${name}" khỏi thư viện?\n(Món này sẽ không bao giờ xuất hiện khi bấm Random nữa)`
      )
    ) {
      deleteRecipe(recipeId);
      setRecipes(getRecipes());
      setPlan(getMealPlan());
    }
  };

  const randomize = (options) => {
    if (!recipes.length) return;
    commitPlan(fillRandomMeals(plan, recipes, { style: selectedRandomStyle, ...options }));
  };

  const clearEntirePlan = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch thực đơn tuần này để chọn lại từ đầu?')) {
      commitPlan(emptyMealPlan());
    }
  };

  // Calculate planned meals progress
  const totalSlots = DAYS.length * MEALS.length;
  const filledSlots = useMemo(() => {
    let count = 0;
    DAYS.forEach((d) => {
      MEALS.forEach((m) => {
        if (plan[d.key]?.[m.key]) count += 1;
      });
    });
    return count;
  }, [plan]);

  const progressPercent = Math.round((filledSlots / totalSlots) * 100);
  const currentStyleInfo = RANDOM_STYLES.find((s) => s.key === selectedRandomStyle);

  const filteredManageRecipes = useMemo(() => {
    const q = manageSearch.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.category && r.category.toLowerCase().includes(q))
    );
  }, [recipes, manageSearch]);

  return (
    <section className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">
              Lên lịch thực đơn tuần
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink/60">
            Tự chọn món ăn hoặc dùng thuật toán Random thông minh theo phong cách ăn uống bạn thích.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsManageRecipesOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-xs sm:text-sm font-semibold text-ink/75 hover:text-leaf hover:border-leaf/50 transition shadow-xs"
            title="Quản lý và xóa món ăn khỏi Random"
          >
            <span>⚙️</span>
            <span>Món tham gia ({recipes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => randomize({ onlyEmpty: true })}
            className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-xs sm:text-sm font-semibold text-leaf hover:border-leaf/50 hover:bg-emerald-50/50 transition shadow-xs"
          >
            <span>🎲</span>
            <span>Lấp đầy ô trống</span>
          </button>
          
          <button
            type="button"
            onClick={() => randomize({ onlyEmpty: false })}
            className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-leaf transition shadow-sm"
          >
            <span>✨</span>
            <span>Random cả tuần</span>
          </button>

          {filledSlots > 0 && (
            <button
              type="button"
              onClick={clearEntirePlan}
              className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50/60 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-100/80 transition"
              title="Xóa tất cả các bữa"
            >
              <span>🗑</span>
              <span className="hidden sm:inline">Xóa lịch</span>
            </button>
          )}
        </div>
      </div>

      {/* Random Style Mode Selector */}
      <div className="rounded-3xl border border-line bg-paper p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/75 flex items-center gap-1.5">
            <span>🎯</span> Chọn phong cách Random món:
          </span>
          {currentStyleInfo && (
            <span className="text-xs text-leaf font-medium italic">
              ℹ️ {currentStyleInfo.description}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {RANDOM_STYLES.map((style) => (
            <button
              key={style.key}
              type="button"
              onClick={() => setSelectedRandomStyle(style.key)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                selectedRandomStyle === style.key
                  ? 'border-leaf bg-emerald-50/70 text-leaf font-bold shadow-xs scale-[1.01]'
                  : 'border-line bg-cream/40 text-ink/70 hover:border-leaf/40 hover:bg-cream'
              }`}
            >
              <span className="text-xl">{style.icon}</span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate">{style.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-line bg-paper p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 font-bold text-sm">
            {progressPercent}%
          </div>
          <div>
            <p className="text-sm font-bold text-ink">
              Đã lên lịch {filledSlots} / {totalSlots} bữa ăn
            </p>
            <p className="text-xs text-ink/60">
              {filledSlots === totalSlots
                ? 'Tuyệt vời! Thực đơn tuần đã hoàn thành đầy đủ.'
                : 'Hãy chọn thêm hoặc bấm "Lấp đầy ô trống" để hoàn tất.'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-60 h-2.5 bg-cream rounded-full overflow-hidden border border-line/60">
          <div
            className="h-full bg-gradient-to-r from-leaf to-sage transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto rounded-3xl border border-line bg-paper shadow-sm">
        <table className="min-w-[840px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-cream/90">
              <th className="sticky left-0 z-10 bg-cream/95 backdrop-blur px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink/70">
                Bữa ăn
              </th>
              {DAYS.map((day) => (
                <th
                  key={day.key}
                  className="px-3 py-3 text-center border-l border-line/60"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-ink">
                      {day.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => randomize({ dayKey: day.key, onlyEmpty: false })}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-leaf border border-line/70 hover:border-leaf hover:bg-emerald-50 transition"
                      title={`Đổi món ngẫu nhiên cho ${day.label}`}
                    >
                      <span>🎲</span> Đổi ngày
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((meal) => (
              <tr
                key={meal.key}
                className="border-b border-line/70 last:border-0 hover:bg-cream/20 transition-colors"
              >
                <th className="sticky left-0 z-10 bg-paper px-4 py-3.5 text-xs sm:text-sm font-bold text-sage border-r border-line/60">
                  <div className="flex items-center gap-1.5">
                    <span>{meal.key === 'breakfast' ? '🌅' : meal.key === 'lunch' ? '☀️' : '🌙'}</span>
                    <span>{meal.label}</span>
                  </div>
                </th>
                {DAYS.map((day) => (
                  <td
                    key={`${day.key}-${meal.key}`}
                    className="p-2 border-l border-line/60 align-top"
                  >
                    <MealSelect
                      recipes={recipes}
                      value={plan[day.key]?.[meal.key] || ''}
                      onChange={(recipeId) =>
                        updateCell(day.key, meal.key, recipeId)
                      }
                      onReroll={() => handleRerollCell(day.key, meal.key)}
                      onDeleteRecipe={handleDeleteRecipe}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Quản lý & Xóa món ăn khỏi Random */}
      {isManageRecipesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsManageRecipesOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-line overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-line bg-cream/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Danh sách món ăn tham gia Random</span>
                </h3>
                <p className="text-xs text-ink/60 mt-0.5">
                  Bạn có thể xóa bớt các món không muốn xuất hiện trong thuật toán Random.
                </p>
              </div>
              <button
                onClick={() => setIsManageRecipesOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/50 hover:bg-stone-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Search filter */}
            <div className="p-4 border-b border-line bg-paper">
              <input
                type="text"
                placeholder="Tìm món để xóa..."
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                className="w-full rounded-2xl border border-line px-3.5 py-2 text-xs sm:text-sm text-ink outline-none focus:border-leaf"
              />
            </div>

            {/* Dishes list */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-line/60">
              {filteredManageRecipes.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink/50">
                  Không tìm thấy món ăn phù hợp
                </p>
              ) : (
                filteredManageRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-cream/40 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-10 h-10 rounded-xl object-cover border border-line flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink truncate">
                          {recipe.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-ink/60">
                          <span>{recipe.category || 'Món ngon'}</span>
                          <span>•</span>
                          <span>{recipe.mealStyle === 'hang-quan' ? '🍜 Quán' : '🍱 Cơm nhà'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 text-xs font-semibold transition flex-shrink-0"
                      title={`Xóa vĩnh viễn món "${recipe.name}"`}
                    >
                      <span>🗑️</span>
                      <span>Xóa</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-line bg-cream/30 flex justify-end">
              <button
                onClick={() => setIsManageRecipesOpen(false)}
                className="px-5 py-2 rounded-full bg-sage hover:bg-leaf text-white font-medium text-xs sm:text-sm transition"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
