import { MapPin, Star, UserRound } from 'lucide-react'
import type { FeaturedProvider } from '../types/customerHomeTypes'

export function FeaturedProviders({ providers }: { providers: FeaturedProvider[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {providers.map((provider) => (
        <article key={provider._id} className="flex min-w-[275px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative shrink-0">
            {provider.userId.avatar ? (
              <img src={provider.userId.avatar} alt={provider.userId.fullName} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600"><UserRound size={28} /></span>
            )}
            <span className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">{provider.userId.fullName}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold"><Star size={15} className="fill-amber-400 text-amber-400" />{provider.avgRating.toFixed(1)} <span className="font-normal text-slate-400">({provider.reviewCount})</span></p>
            <p className="mt-1 truncate text-xs text-slate-500">{provider.serviceCategories.map((item) => item.name).join(', ') || `${provider.experienceYears} năm kinh nghiệm`}</p>
            {provider.workingAreas[0] && <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-blue-600"><MapPin size={13} />{provider.workingAreas[0]}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}
