import { CalendarDays, Clock3, Eye, Lightbulb, Quote } from 'lucide-react'
import type { Blog } from '../types/blogTypes'
import { SafeRichText } from './SafeRichText'

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value)) : 'Bản nháp'

export function BlogArticle({ blog }: { blog: Blog }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-72 sm:h-[420px]">
        <img src={blog.coverImage.url} alt={blog.coverImage.alt || blog.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold">{blog.category}</span>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{blog.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-200 sm:text-base">{blog.excerpt}</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-10 sm:py-12">
        <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500">
          <span className="font-bold text-slate-800">{blog.authorId?.fullName || 'FixNow'}</span>
          <span className="flex items-center gap-1.5"><CalendarDays size={16} />{formatDate(blog.publishedAt || blog.updatedAt)}</span>
          <span className="flex items-center gap-1.5"><Clock3 size={16} />{blog.readTimeMinutes} phút đọc</span>
          <span className="flex items-center gap-1.5"><Eye size={16} />{blog.viewCount} lượt xem</span>
        </div>
        {blog.sections.some((section) => section.heading.trim()) && (
          <nav className="mb-10 rounded-2xl bg-slate-50 p-5">
            <p className="font-extrabold text-slate-900">Nội dung bài viết</p>
            <ol className="mt-3 space-y-2 text-sm text-blue-700">
              {blog.sections.map((section, index) => section.heading.trim() ? (
                <li key={section._id || `${section.heading}-${index}`}>
                  <a href={`#section-${index}`}>{section.label ? `${section.label}: ` : ''}{section.heading}</a>
                </li>
              ) : null)}
            </ol>
          </nav>
        )}
        <div className="space-y-12">
          {blog.sections.map((section, index) => (
            <section id={`section-${index}`} className="scroll-mt-24" key={section._id || `${section.heading}-${index}`}>
              {section.label && <p className="text-sm font-black uppercase tracking-widest text-blue-600">{section.label}</p>}
              {section.heading && <h2 className={`${section.label ? 'mt-2' : ''} text-2xl font-black text-slate-950 sm:text-3xl`}>{section.heading}</h2>}
              <SafeRichText html={section.content} className={`${section.heading || section.label ? 'mt-5' : ''} text-base leading-8 text-slate-700`} />
              {section.images.length > 0 && (
                <div className={`mt-7 grid gap-4 ${section.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {section.images.map((image, imageIndex) => (
                    <figure key={`${image.url}-${imageIndex}`} className="overflow-hidden rounded-2xl bg-slate-100">
                      <img src={image.url} alt={image.alt || section.heading} className="max-h-[520px] w-full object-cover" />
                      {image.caption && <figcaption className="p-3 text-center text-xs text-slate-500">{image.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
              {section.quote && (
                <blockquote className="mt-7 flex gap-4 rounded-2xl border-l-4 border-blue-600 bg-blue-50 p-5 text-lg font-semibold italic text-blue-950">
                  <Quote className="shrink-0 text-blue-500" size={24} />{section.quote}
                </blockquote>
              )}
              {section.tips.length > 0 && (
                <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="flex items-center gap-2 font-extrabold text-amber-900"><Lightbulb size={19} />Lưu ý hữu ích</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-950">
                    {section.tips.map((tip, tipIndex) => <li key={`${tip}-${tipIndex}`}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
          {blog.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">#{tag}</span>)}
        </div>
      </div>
    </article>
  )
}
