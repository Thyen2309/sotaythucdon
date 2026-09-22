export default function MealSelect({
  recipes,
  value,
  onChange,
  onReroll,
  onDeleteRecipe,
}) {
  const selectedRecipe = recipes.find((r) => r.id === value);

  const handleDeletePermanent = (e) => {
    e.stopPropagation();
    if (!selectedRecipe) return;
    if (
      window.confirm(
        `Bạn có chắc muốn xóa vĩnh viễn món "${selectedRecipe.name}" khỏi thư viện?\n(Món này sẽ không bao giờ xuất hiện trong Random nữa)`
      )
    ) {
      if (onDeleteRecipe) onDeleteRecipe(selectedRecipe.id);
    }
  };

  return (
    <div className="relative group">
      {selectedRecipe ? (
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-leaf/30 bg-emerald-50/50 hover:bg-emerald-50/90 transition-all shadow-xs">
          <img
            src={selectedRecipe.image}
            alt={selectedRecipe.name}
            className="w-8 h-8 rounded-xl object-cover flex-shrink-0 shadow-xs border border-white"
          />
          <div className="flex-1 min-w-0">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer truncate"
              title={selectedRecipe.name}
            >
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onReroll && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReroll();
                }}
                title="Đổi ngẫu nhiên món khác cho bữa này"
                className="w-6 h-6 flex items-center justify-center rounded-full text-xs text-ink/50 hover:text-leaf hover:bg-white transition"
              >
                🎲
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              title="Bỏ món này khỏi bữa (để trống ô)"
              className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-ink/40 hover:text-amber-600 hover:bg-amber-50 transition"
            >
              ✕
            </button>

            {onDeleteRecipe && (
              <button
                type="button"
                onClick={handleDeletePermanent}
                title="Xóa vĩnh viễn món này khỏi thư viện & Random"
                className="w-6 h-6 flex items-center justify-center rounded-full text-xs text-ink/40 hover:text-red-600 hover:bg-red-100 transition"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <select
            value=""
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-dashed border-line bg-paper/60 px-3 py-2 text-xs text-ink/50 outline-none hover:border-leaf/50 hover:bg-white hover:text-ink transition cursor-pointer"
          >
            <option value="">＋ Chọn món ăn...</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
