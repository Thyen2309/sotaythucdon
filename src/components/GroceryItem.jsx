export default function GroceryItem({ item, checked, onToggle }) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all select-none ${
        checked
          ? 'bg-emerald-50/40'
          : 'hover:bg-cream/60'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item.key)}
        className="h-4 w-4 rounded-md border-line accent-leaf cursor-pointer"
      />
      <span
        className={`flex-1 text-sm font-medium transition-all ${
          checked ? 'line-through text-ink/40' : 'text-ink'
        }`}
      >
        {item.name}
      </span>
      <span
        className={`text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full transition-all ${
          checked
            ? 'bg-stone-100 text-stone-400 line-through'
            : 'bg-emerald-100/60 text-leaf'
        }`}
      >
        {item.quantity} {item.unit}
      </span>
    </label>
  );
}

