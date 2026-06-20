import { ImageIcon, Wrench } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { formatCurrency } from '../../../shared/utils/format'
import type { Category, Service } from '../../service/types/serviceTypes'

type CategorySelectionCardProps = {
  category: Category
  selected: boolean
  onSelect: () => void
}

export function CategorySelectionCard({
  category,
  selected,
  onSelect,
}: CategorySelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex min-h-24 flex-col items-center rounded-xl border px-2.5 py-3 text-center transition duration-200',
        selected
          ? 'border-blue-600 bg-blue-50 shadow-[0_8px_24px_-16px_rgba(37,99,235,0.8)] ring-1 ring-blue-600'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition',
          selected ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-50',
        )}
      >
        {category.iconUrl ? (
          <img
            src={category.iconUrl}
            alt=""
            className={cn('h-6 w-6 object-contain', selected && 'brightness-0 invert')}
            onError={(event) => {
              event.currentTarget.style.display = 'none'
              event.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <Wrench
          aria-hidden="true"
          size={20}
          className={cn(
            category.iconUrl && 'hidden',
            selected ? 'text-white' : 'text-blue-600',
          )}
        />
      </span>

      <strong className="mt-2 line-clamp-2 text-xs leading-4 text-slate-900 sm:text-sm">
        {category.name}
      </strong>
    </button>
  )
}

type ServiceSelectionCardProps = {
  service: Service
  selected: boolean
  onSelect: () => void
}

export function ServiceSelectionCard({
  service,
  selected,
  onSelect,
}: ServiceSelectionCardProps) {
  const imageUrl = service.image?.find(Boolean)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group overflow-hidden rounded-2xl border text-left transition duration-200',
        selected
          ? 'border-blue-600 bg-blue-50 shadow-[0_10px_28px_-18px_rgba(37,99,235,0.85)] ring-1 ring-blue-600'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md',
      )}
    >
      <span className="relative block h-32 overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 sm:h-36">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
              event.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <span
          className={cn(
            'absolute inset-0 items-center justify-center text-blue-300',
            imageUrl ? 'hidden' : 'flex',
          )}
        >
          <ImageIcon aria-hidden="true" size={38} />
        </span>
        {selected && (
          <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
            Đã chọn
          </span>
        )}
      </span>

      <span className="block p-4">
        <span className="flex items-start justify-between gap-3">
          <strong className="line-clamp-2 text-sm text-slate-900 sm:text-base">
            {service.name}
          </strong>
          <strong className="shrink-0 text-sm text-blue-600">
            {formatCurrency(service.price)}
          </strong>
        </span>
        <span className="mt-2 line-clamp-2 block text-xs leading-5 text-slate-500 sm:text-sm">
          {service.description || 'Dịch vụ được cung cấp bởi kỹ thuật viên FixNow'}
        </span>
      </span>
    </button>
  )
}
