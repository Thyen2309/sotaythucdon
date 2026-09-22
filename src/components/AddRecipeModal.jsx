import { useState } from 'react';
import { CATEGORY_LABELS } from '../data/constants';

const PRESET_IMAGES = [
  { label: 'Bún / Phở', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80' },
  { label: 'Xôi / Nếp', url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cơm / Đĩa', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bánh mì', url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Món kho / Mặn', url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80' },
  { label: 'Món canh / Nước', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
  { label: 'Món xào / Đậu', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cá / Hải sản', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
];

export default function AddRecipeModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [mealStyle, setMealStyle] = useState('com-nha');
  const [category, setCategory] = useState('Món mặn');
  const [time, setTime] = useState('30 phút');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [servings, setServings] = useState('3 người');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[2].url);

  // Dynamic ingredients list
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: 200, unit: 'g', category: 'Thịt' },
    { name: '', quantity: 1, unit: 'củ', category: 'Rau' },
    { name: '', quantity: 1, unit: 'muỗng canh', category: 'Gia vị' },
  ]);

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: 1, unit: 'phần', category: 'Rau' },
    ]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, val) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: val };
    setIngredients(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên món ăn!');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      alert('Vui lòng thêm ít nhất 1 nguyên liệu!');
      return;
    }

    const newId =
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `recipe-${Date.now()}`;

    const newRecipe = {
      id: `${newId}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      tag: category,
      category,
      mealStyle,
      time: time.trim() || '30 phút',
      difficulty,
      servings: servings.trim() || '3 người',
      description: description.trim() || `Món ${name} tự làm thơm ngon cho bữa ăn gia đình.`,
      image: image.trim() || PRESET_IMAGES[0].url,
      ingredients: validIngredients,
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-paper shadow-2xl border border-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold font-display text-ink">
              Thêm món ăn mới vào thư viện
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-cream hover:text-ink transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tên món & Phong cách ăn */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
                Tên món ăn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Xôi gà xé, Bún ốc nguội, Thịt bò xào cần tỏi..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-line bg-cream/50 px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf focus:bg-white transition"
              />
            </div>

            {/* Kiểu bữa ăn (Phong cách Random) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                Kiểu món ăn (dùng cho thuật toán Random)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                    mealStyle === 'com-nha'
                      ? 'border-leaf bg-emerald-50/50 shadow-xs'
                      : 'border-line bg-cream/30 hover:border-leaf/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="mealStyle"
                    value="com-nha"
                    checked={mealStyle === 'com-nha'}
                    onChange={() => setMealStyle('com-nha')}
                    className="mt-1 accent-leaf"
                  />
                  <div>
                    <p className="text-sm font-bold text-ink flex items-center gap-1">
                      <span>🍱</span> Cơm nhà ấm cúng
                    </p>
                    <p className="text-xs text-ink/60 mt-0.5">
                      Món kho, xào, canh ăn cùng cơm nóng trong bữa trưa hoặc tối gia đình.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                    mealStyle === 'hang-quan'
                      ? 'border-leaf bg-emerald-50/50 shadow-xs'
                      : 'border-line bg-cream/30 hover:border-leaf/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="mealStyle"
                    value="hang-quan"
                    checked={mealStyle === 'hang-quan'}
                    onChange={() => setMealStyle('hang-quan')}
                    className="mt-1 accent-leaf"
                  />
                  <div>
                    <p className="text-sm font-bold text-ink flex items-center gap-1">
                      <span>🍜</span> Hàng quán & Bún xôi
                    </p>
                    <p className="text-xs text-ink/60 mt-0.5">
                      Phở, bún, xôi, bánh mì, hủ tiếu, bánh cuốn... thích hợp ăn sáng hoặc đổi vị.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Phân loại & Thông tin phụ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Phân loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs sm:text-sm text-ink outline-none focus:border-leaf"
              >
                <option value="Món mặn">Món mặn</option>
                <option value="Món canh">Món canh</option>
                <option value="Món cơm">Món cơm</option>
                <option value="Món nước">Món nước</option>
                <option value="Ăn nhẹ">Ăn nhẹ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Thời gian nấu
              </label>
              <input
                type="text"
                placeholder="25 phút"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs sm:text-sm text-ink outline-none focus:border-leaf"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Khẩu phần
              </label>
              <input
                type="text"
                placeholder="3 người"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs sm:text-sm text-ink outline-none focus:border-leaf"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Độ khó
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs sm:text-sm text-ink outline-none focus:border-leaf"
              >
                <option value="Dễ">Dễ</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Kỳ công">Kỳ công</option>
              </select>
            </div>
          </div>

          {/* Hình ảnh món ăn & Preset */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
              Hình ảnh món ăn (Chọn nhanh ảnh đẹp hoặc dán URL)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setImage(preset.url)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    image === preset.url
                      ? 'bg-leaf text-white shadow-xs'
                      : 'border border-line bg-cream/60 text-ink/70 hover:border-leaf'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <img
                src={image || PRESET_IMAGES[0].url}
                alt="Preview"
                className="h-14 w-14 rounded-2xl object-cover border border-line flex-shrink-0 bg-stone-100"
                onError={(e) => {
                  e.target.src = PRESET_IMAGES[0].url;
                }}
              />
              <input
                type="url"
                placeholder="Dán URL hình ảnh món ăn nếu có..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 rounded-2xl border border-line bg-cream/50 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-leaf"
              />
            </div>
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
              Mô tả hương vị / Ghi chú nấu
            </label>
            <textarea
              rows={2}
              placeholder="Hương vị thơm bùi, bí quyết sơ chế hoặc cách thưởng thức ngon nhất..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-line bg-cream/50 p-3 text-xs sm:text-sm text-ink outline-none focus:border-leaf resize-none"
            />
          </div>

          {/* Danh sách nguyên liệu */}
          <div className="space-y-3 pt-2 border-t border-line/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
                Nguyên liệu cần chuẩn bị ({ingredients.length})
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 text-xs font-bold text-leaf hover:underline"
              >
                <span>＋ Thêm dòng nguyên liệu</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-cream/40 p-2 border border-line/60"
                >
                  <input
                    type="text"
                    required
                    placeholder="Tên nguyên liệu (VD: Thịt gà, Cà chua...)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-leaf"
                  />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="SL"
                    value={ing.quantity}
                    onChange={(e) =>
                      handleIngredientChange(idx, 'quantity', Number(e.target.value) || 0)
                    }
                    className="w-16 rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-leaf text-center"
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị (g, kg, quả)"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="w-20 rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-leaf text-center"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => handleIngredientChange(idx, 'category', e.target.value)}
                    className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-leaf"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 text-xs"
                      title="Xóa dòng này"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold text-ink/60 hover:bg-cream transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-full bg-sage px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-leaf transition shadow-sm"
            >
              Lưu món vào thư viện
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
