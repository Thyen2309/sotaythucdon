import { CATEGORY_LABELS } from '../data/constants';

export default function RecipeModal({ recipe, onClose, onDelete }) {
  if (!recipe) return null;

  // Group ingredients by category
  const groupedIngredients = recipe.ingredients.reduce((acc, item) => {
    const cat = item.category || 'Khác';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/75 transition backdrop-blur-md"
            aria-label="Đóng"
          >
            ✕
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/95 text-white backdrop-blur shadow-sm">
                {recipe.category || 'Món ngon'}
              </span>
              {recipe.mealStyle && (
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/25 text-white backdrop-blur shadow-sm">
                  {recipe.mealStyle === 'hang-quan' ? '🍜 Hàng quán & Bún xôi' : '🍱 Cơm nhà chuẩn vị'}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display leading-tight drop-shadow">
              {recipe.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick info pills */}
          <div className="grid grid-cols-3 gap-3 py-3 px-4 rounded-2xl bg-cream border border-line text-center">
            <div>
              <p className="text-xs text-ink/60 font-medium">Thời gian</p>
              <p className="text-sm sm:text-base font-semibold text-leaf mt-0.5">
                ⏱ {recipe.time || '30 phút'}
              </p>
            </div>
            <div className="border-x border-line">
              <p className="text-xs text-ink/60 font-medium">Khẩu phần</p>
              <p className="text-sm sm:text-base font-semibold text-leaf mt-0.5">
                👥 {recipe.servings || '4 người'}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/60 font-medium">Độ khó</p>
              <p className="text-sm sm:text-base font-semibold text-leaf mt-0.5">
                ✨ {recipe.difficulty || 'Dễ'}
              </p>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/60 mb-2">
                Giới thiệu món ăn
              </h3>
              <p className="text-ink/80 text-sm sm:text-base leading-relaxed italic bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60">
                "{recipe.description}"
              </p>
            </div>
          )}

          {/* Ingredients list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink">
                🛒 Nguyên liệu cần chuẩn bị ({recipe.ingredients.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(groupedIngredients).map(([cat, items]) => (
                <div
                  key={cat}
                  className="p-4 rounded-2xl border border-line bg-paper/60 space-y-2"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-leaf flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-leaf"></span>
                    {CATEGORY_LABELS[cat] || cat}
                  </h4>
                  <ul className="divide-y divide-line/60 text-sm">
                    {items.map((ing, idx) => (
                      <li
                        key={idx}
                        className="py-1.5 flex items-center justify-between gap-2"
                      >
                        <span className="text-ink font-medium">{ing.name}</span>
                        <span className="text-xs sm:text-sm text-leaf/90 font-semibold tabular-nums">
                          {ing.quantity} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Footer action */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(recipe)}
                className="px-4 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
              >
                <span>🗑️</span>
                <span>Xóa món này khỏi thư viện</span>
              </button>
            ) : <div />}
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-sage hover:bg-leaf text-white font-medium text-sm transition shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
