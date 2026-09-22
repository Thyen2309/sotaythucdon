export default function RecipeCard({ recipe, onSelect, onDelete }) {
  return (
    <article
      onClick={() => onSelect && onSelect(recipe)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] hover:border-leaf/30 flex flex-col"
    >
      {/* Image with zoom effect & badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <img
          src={recipe.image}
          alt={recipe.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-85 transition-opacity" />

        {/* Top Badges & Delete button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-leaf backdrop-blur-md shadow-sm">
              {recipe.category || 'Món ngon'}
            </span>
            {recipe.mealStyle && (
              <span className="rounded-full bg-amber-500/95 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-md shadow-sm">
                {recipe.mealStyle === 'hang-quan' ? '🍜 Quán' : '🍱 Cơm nhà'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {recipe.time && (
              <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
                ⏱ {recipe.time}
              </span>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe);
                }}
                title={`Xóa món "${recipe.name}"`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/90 hover:bg-red-600 hover:text-white transition backdrop-blur-md hover:scale-110 shadow-sm"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <div>
          <h2 className="text-lg font-bold font-display text-ink group-hover:text-leaf transition-colors line-clamp-1">
            {recipe.name}
          </h2>
          {recipe.description && (
            <p className="mt-1 text-xs text-ink/70 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
          <span className="font-medium text-ink/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {recipe.ingredients.length} nguyên liệu
          </span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe);
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                title={`Xóa món ${recipe.name}`}
              >
                Xóa món
              </button>
            )}
            <span className="font-semibold text-leaf group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Chi tiết <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

