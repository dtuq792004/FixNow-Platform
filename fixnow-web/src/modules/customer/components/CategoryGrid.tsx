import { Wrench } from 'lucide-react'
import type { Category } from '../../service/types/serviceTypes'

export function CategoryGrid({
  categories,
  onSelect,
}: {
  categories: Category[]
  onSelect: (categoryId: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {categories.slice(0, 6).map((category, index) => (
        <button
          key={category._id}
          type="button"
          onClick={() => onSelect(category._id)}
          className="group rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${['bg-blue-50', 'bg-cyan-50', 'bg-indigo-50', 'bg-amber-50', 'bg-emerald-50'][index % 5]}`}>
            {category.iconUrl ? (
              <img src={category.iconUrl} alt="" className="h-7 w-7 object-contain opacity-75 transition group-hover:opacity-100" />
            ) : (
              <Wrench size={27} className="text-blue-600" />
            )}
          </span>
          <span className="mt-3 block text-sm font-semibold text-slate-800">{category.name}</span>
        </button>
      ))}
    </div>
  )
}
