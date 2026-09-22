import { useState, useMemo, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard.jsx';
import RecipeModal from '../components/RecipeModal.jsx';
import AddRecipeModal from '../components/AddRecipeModal.jsx';
import { getRecipes, saveRecipe, deleteRecipe } from '../services/storage';

const CATEGORIES = ['Tất cả', 'Món nước', 'Món cơm', 'Món mặn', 'Món canh', 'Ăn nhẹ'];

const STYLE_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'com-nha', label: '🍱 Cơm nhà' },
  { key: 'hang-quan', label: '🍜 Hàng quán' },
];

export default function Home() {
  const [recipes, setRecipes] = useState(() => getRecipes());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Auto reload when SQL data is synced
  useEffect(() => {
    const handleUpdate = () => {
      setRecipes(getRecipes());
    };
    window.addEventListener('bepnha_data_updated', handleUpdate);
    return () => window.removeEventListener('bepnha_data_updated', handleUpdate);
  }, []);

  const handleSaveNewRecipe = (newRecipe) => {
    saveRecipe(newRecipe);
    setRecipes(getRecipes());
  };

  const handleDeleteRecipe = (recipe) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa món "${recipe.name}" khỏi thư viện?\n(Món này cũng sẽ được gỡ khỏi tất cả bữa ăn trong lịch tuần)`
      )
    ) {
      deleteRecipe(recipe.id);
      setRecipes(getRecipes());
      if (activeRecipe?.id === recipe.id) {
        setActiveRecipe(null);
      }
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchCategory =
        selectedCategory === 'Tất cả' ||
        recipe.category === selectedCategory ||
        recipe.tag === selectedCategory;

      const matchStyle =
        selectedStyle === 'all' || recipe.mealStyle === selectedStyle;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCategory && matchStyle;

      const matchName = recipe.name.toLowerCase().includes(query);
      const matchIngredients = recipe.ingredients.some((i) =>
        i.name.toLowerCase().includes(query)
      );

      return matchCategory && matchStyle && (matchName || matchIngredients);
    });
  }, [recipes, selectedCategory, selectedStyle, searchQuery]);

  return (
    <section className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sage via-leaf to-sage p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            🌿 Bếp ấm yêu thương • {recipes.length} món ăn
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-paper">
            Hôm nay bạn muốn nấu món gì?
          </h1>
          <p className="text-sm sm:text-base text-cream/90 leading-relaxed font-normal">
            Khám phá các công thức món ăn truyền thống, món hàng quán thơm ngon hoặc tự thêm món ăn ruột của gia đình để lên lịch tự động.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-sage hover:bg-cream transition shadow-md hover:scale-105"
            >
              <span>➕</span>
              <span>Thêm món mới</span>
            </button>
          </div>
        </div>
        
        {/* Subtle decorative culinary background elements */}
        <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 select-none pointer-events-none">
          🍲
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        {/* Style Filter (Cơm nhà vs Hàng quán) & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Style Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-paper p-1 shadow-xs">
            {STYLE_FILTERS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStyle(tab.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all ${
                  selectedStyle === tab.key
                    ? 'bg-sage text-white shadow-xs'
                    : 'text-ink/70 hover:text-leaf hover:bg-cream/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Tìm món, nguyên liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper pl-10 pr-4 py-2 text-xs sm:text-sm text-ink placeholder-ink/40 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 shadow-xs"
            />
            <span className="absolute left-3.5 top-2.5 text-ink/40 text-sm">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs text-ink/40 hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-leaf text-white shadow-xs'
                  : 'border border-line bg-paper text-ink/70 hover:border-leaf hover:text-leaf'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-paper p-12 text-center space-y-3">
          <p className="text-4xl">🍳</p>
          <p className="text-base font-semibold text-ink">
            Không tìm thấy món ăn phù hợp
          </p>
          <p className="text-xs text-ink/50">
            Thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để tự thêm món này vào thư viện.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSelectedStyle('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-leaf underline underline-offset-4"
            >
              Đặt lại bộ lọc
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-full bg-sage px-4 py-1.5 text-xs font-semibold text-white hover:bg-leaf"
            >
              ＋ Thêm món mới
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={(r) => setActiveRecipe(r)}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {activeRecipe && (
        <RecipeModal
          recipe={activeRecipe}
          onClose={() => setActiveRecipe(null)}
          onDelete={handleDeleteRecipe}
        />
      )}

      {/* Modal Add Recipe */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewRecipe}
      />
    </section>
  );
}


