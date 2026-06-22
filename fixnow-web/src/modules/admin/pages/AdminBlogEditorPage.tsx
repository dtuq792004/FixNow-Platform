import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Plus, Save, Send, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminError, AdminLoading, AdminPageHeader } from '../components/AdminUi'
import { RichTextEditor } from '../components/RichTextEditor'
import { hasRichTextContent } from '../utils/richText'
import { blogService } from '../services/blogService'
import type { Blog, BlogImage, BlogPayload, BlogSection, BlogStatus } from '../types/blogTypes'
import { useCategoriesQuery, useServicesQuery } from '../../service/hooks/useServices'

const emptyImage = (): BlogImage => ({ url: '', alt: '', caption: '' })
const emptySection = (): BlogSection => ({ label: '', heading: '', content: '', images: [], quote: '', tips: [] })
const todayInputValue = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
const initialPayload: BlogPayload = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  categoryId: '',
  serviceName: '',
  tags: [],
  coverImage: emptyImage(),
  sections: [emptySection()],
  status: 'DRAFT',
  isFeatured: false,
  readTimeMinutes: 5,
  publishedAt: todayInputValue(),
  seoTitle: '',
  seoDescription: '',
}

function ImageFields({ image, onChange, onRemove, onUpload }: {
  image: BlogImage
  onChange: (image: BlogImage) => void
  onRemove?: () => void
  onUpload: (file: File) => Promise<void>
}) {
  const [uploading, setUploading] = useState(false)
  const upload = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { await onUpload(file) } finally { setUploading(false) }
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      {image.url && <img src={image.url} alt={image.alt} className="mb-3 h-36 w-full rounded-lg object-cover" />}
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={image.url} onChange={(event) => onChange({ ...image, url: event.target.value })} placeholder="URL ảnh" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" />
        <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 text-sm font-bold text-blue-700">
          <Upload size={15} />{uploading ? 'Đang tải...' : 'Tải ảnh lên'}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} />
        </label>
        <input value={image.alt} onChange={(event) => onChange({ ...image, alt: event.target.value })} placeholder="Mô tả ảnh (alt)" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" />
        <input value={image.caption} onChange={(event) => onChange({ ...image, caption: event.target.value })} placeholder="Chú thích ảnh" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" />
      </div>
      {onRemove && <button type="button" onClick={onRemove} className="mt-3 flex items-center gap-1 text-xs font-bold text-red-600"><Trash2 size={14} />Xóa ảnh</button>}
    </div>
  )
}

function MultipleImageUpload({ onUpload }: { onUpload: (files: File[]) => Promise<void> }) {
  const [uploading, setUploading] = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      await onUpload(Array.from(files))
    } finally {
      setUploading(false)
    }
  }

  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
      <ImagePlus size={16} />
      {uploading ? 'Đang tải nhiều ảnh...' : 'Chọn nhiều ảnh'}
      <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(event) => upload(event.target.files)} />
    </label>
  )
}

export function AdminBlogEditorPage() {
  const { blogId } = useParams()
  const isEditing = Boolean(blogId)
  const detail = useQuery({ queryKey: ['admin', 'blog', blogId], queryFn: () => blogService.getAdmin(blogId!), enabled: isEditing })

  if (detail.isLoading) return <div className="p-6"><AdminLoading /></div>
  if (detail.error) return <div className="p-6"><AdminError message="Không thể tải bài viết." /></div>

  return <AdminBlogEditorForm key={detail.data?._id || 'new'} blogId={blogId} initialBlog={detail.data} />
}

function toPayload(blog?: Blog): BlogPayload {
  if (!blog) return initialPayload
  const { title, slug, excerpt, category, categoryId, serviceName, tags, coverImage, sections, status, isFeatured, readTimeMinutes, publishedAt, seoTitle, seoDescription } = blog
  return {
    title,
    slug,
    excerpt,
    category,
    categoryId: typeof categoryId === 'object' && categoryId ? categoryId._id : categoryId || '',
    serviceName: serviceName || '',
    tags,
    coverImage,
    sections,
    status,
    isFeatured,
    readTimeMinutes,
    publishedAt,
    seoTitle,
    seoDescription,
  }
}

function AdminBlogEditorForm({ blogId, initialBlog }: { blogId?: string; initialBlog?: Blog }) {
  const isEditing = Boolean(blogId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BlogPayload>(() => toPayload(initialBlog))
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')
  const categoriesQuery = useCategoriesQuery()
  const selectedCategoryId = typeof form.categoryId === 'string' ? form.categoryId : form.categoryId?._id || ''
  const servicesQuery = useServicesQuery(selectedCategoryId || undefined)
  const serviceNames = [...new Set((servicesQuery.data ?? []).map((service) => service.name.trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, 'vi'))

  const save = useMutation({
    mutationFn: (payload: BlogPayload) => isEditing ? blogService.update(blogId!, payload) : blogService.create(payload),
    onSuccess: async (blog) => {
      queryClient.setQueryData(['admin', 'blog', blog._id], blog)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'blogs'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'blog'] }),
      ])
      navigate(`/admin/blogs/${blog._id}`)
    },
    onError: (reason: Error) => setError(reason.message),
  })

  const updateSection = (index: number, value: BlogSection) =>
    setForm((current) => ({ ...current, sections: current.sections.map((section, sectionIndex) => sectionIndex === index ? value : section) }))
  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= form.sections.length) return
    const sections = [...form.sections]
    ;[sections[index], sections[target]] = [sections[target], sections[index]]
    setForm({ ...form, sections })
  }
  const uploadImage = async (file: File, done: (url: string) => void) => done(await blogService.uploadImage(file))
  const uploadSectionImages = async (sectionIndex: number, files: File[]) => {
    const urls = await Promise.all(files.map((file) => blogService.uploadImage(file)))
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, index) => index === sectionIndex
        ? { ...section, images: [...section.images, ...urls.map((url) => ({ ...emptyImage(), url }))] }
        : section),
    }))
  }

  const submit = (status: BlogStatus) => {
    setError('')
    const payload = {
      ...form,
      status,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category.trim(),
      categoryId: selectedCategoryId,
      serviceName: form.serviceName?.trim(),
      tags: tagInput.trim() ? [...form.tags, ...tagInput.split(',').map((tag) => tag.trim()).filter(Boolean)] : form.tags,
    }
    if (!payload.title || !payload.excerpt || !payload.category || !payload.categoryId || !payload.serviceName || !payload.coverImage.url) return setError('Vui lòng nhập tiêu đề, mô tả, chọn danh mục, dịch vụ và ảnh bìa.')
    if (status === 'PUBLISHED' && !payload.publishedAt) return setError('Vui lòng chọn ngày đăng trước khi xuất bản.')
    if (payload.sections.some((section) => !hasRichTextContent(section.content))) return setError('Mỗi khối cần có nội dung chi tiết.')
    save.mutate(payload)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Link to={isEditing ? `/admin/blogs/${blogId}` : '/admin/blogs'} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"><ArrowLeft size={18} />Quay lại</Link>
      <AdminPageHeader title={isEditing ? 'Chỉnh sửa cẩm nang' : 'Tạo cẩm nang mới'} description="Xây dựng bài viết theo từng phần, thêm ảnh minh họa, lưu ý và thông tin SEO." />
      {error && <AdminError message={error} />}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold">Thông tin chính</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">Tiêu đề *</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-400" placeholder="Ví dụ: 7 bước bảo dưỡng máy lạnh tại nhà" /></label>
              <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">Slug</span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" placeholder="Tự tạo từ tiêu đề nếu để trống" /></label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Danh mục dịch vụ *</span>
                <select
                  value={selectedCategoryId}
                  onChange={(event) => {
                    const category = categoriesQuery.data?.find((item) => item._id === event.target.value)
                    setForm({ ...form, categoryId: event.target.value, category: category?.name || '', serviceName: '' })
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Chọn danh mục</option>
                  {categoriesQuery.data?.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Dịch vụ của bài viết *</span>
                <select
                  value={form.serviceName || ''}
                  disabled={!selectedCategoryId || servicesQuery.isLoading}
                  onChange={(event) => setForm({ ...form, serviceName: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 disabled:bg-slate-100"
                >
                  <option value="">{servicesQuery.isLoading ? 'Đang tải dịch vụ...' : 'Chọn dịch vụ'}</option>
                  {serviceNames.map((serviceName) => <option key={serviceName} value={serviceName}>{serviceName}</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                <label><span className="mb-1.5 block text-sm font-bold">Thời gian đọc</span><input type="number" min={1} value={form.readTimeMinutes} onChange={(event) => setForm({ ...form, readTimeMinutes: Math.max(1, Number(event.target.value)) })} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" /></label>
                <label><span className="mb-1.5 block text-sm font-bold">Ngày đăng</span><input type="date" value={form.publishedAt?.slice(0, 10) || ''} onChange={(event) => setForm({ ...form, publishedAt: event.target.value || null })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400" /></label>
              </div>
              <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">Mô tả ngắn *</span><textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} rows={4} maxLength={500} className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-400" placeholder="Tóm tắt giá trị người đọc nhận được..." /></label>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-sm font-extrabold">Ảnh bìa *</h3>
              <ImageFields image={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} onUpload={(file) => uploadImage(file, (url) => setForm((current) => ({ ...current, coverImage: { ...current.coverImage, url } })))} />
            </div>
          </section>
          <section className="space-y-5">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div><h2 className="text-xl font-extrabold">Các khối nội dung</h2><p className="text-sm text-slate-500">Tự đặt nhãn như “Phần 1”, “Đoạn 1” hoặc để trống tùy cấu trúc bài viết.</p></div>
              <button type="button" onClick={() => setForm({ ...form, sections: [...form.sections, emptySection()] })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 sm:w-auto"><Plus size={17} />Thêm khối</button>
            </div>
            {form.sections.map((section, index) => (
              <article key={section._id || index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-extrabold text-blue-700">Khối nội dung {index + 1}</h3>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="rounded-lg p-2 text-slate-500 disabled:opacity-30"><ArrowUp size={17} /></button>
                    <button type="button" onClick={() => moveSection(index, 1)} disabled={index === form.sections.length - 1} className="rounded-lg p-2 text-slate-500 disabled:opacity-30"><ArrowDown size={17} /></button>
                    <button type="button" disabled={form.sections.length === 1} onClick={() => setForm({ ...form, sections: form.sections.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg p-2 text-red-500 disabled:opacity-30"><Trash2 size={17} /></button>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-600">Nhãn hiển thị</span>
                      <input value={section.label || ''} onChange={(event) => updateSection(index, { ...section, label: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" placeholder="Phần 1 / Đoạn 1" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-600">Tiêu đề khối</span>
                      <input value={section.heading} onChange={(event) => updateSection(index, { ...section, heading: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-blue-400" placeholder="Có thể để trống nếu chỉ cần một đoạn văn" />
                    </label>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-bold text-slate-600">Nội dung chi tiết *</p>
                    <RichTextEditor value={section.content} onChange={(content) => updateSection(index, { ...section, content })} />
                  </div>
                  <textarea value={section.quote} onChange={(event) => updateSection(index, { ...section, quote: event.target.value })} rows={2} className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-400" placeholder="Trích dẫn nổi bật (không bắt buộc)" />
                  <textarea value={section.tips.join('\n')} onChange={(event) => updateSection(index, { ...section, tips: event.target.value.split('\n').filter(Boolean) })} rows={3} className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-400" placeholder={'Các lưu ý, mỗi dòng một ý\nVí dụ: Ngắt nguồn điện trước khi thao tác'} />
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold">Ảnh minh họa</p>
                        <p className="mt-0.5 text-xs text-slate-500">Có thể chọn và tải nhiều ảnh trong một lần.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <MultipleImageUpload onUpload={(files) => uploadSectionImages(index, files)} />
                        <button type="button" onClick={() => updateSection(index, { ...section, images: [...section.images, emptyImage()] })} className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"><Plus size={16} />Thêm bằng URL</button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {section.images.map((image, imageIndex) => (
                        <ImageFields
                          key={imageIndex}
                          image={image}
                          onChange={(value) => updateSection(index, { ...section, images: section.images.map((item, itemIndex) => itemIndex === imageIndex ? value : item) })}
                          onRemove={() => updateSection(index, { ...section, images: section.images.filter((_, itemIndex) => itemIndex !== imageIndex) })}
                          onUpload={(file) => uploadImage(file, (url) => updateSection(index, { ...section, images: section.images.map((item, itemIndex) => itemIndex === imageIndex ? { ...item, url } : item) }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
        <aside className="space-y-5 xl:sticky xl:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold">Xuất bản</h2>
            <label className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} className="h-4 w-4" />Đánh dấu bài nổi bật</label>
            <div className="mt-4 grid gap-2">
              <button type="button" disabled={save.isPending} onClick={() => submit('PUBLISHED')} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"><Send size={17} />{save.isPending ? 'Đang lưu...' : 'Lưu & xuất bản'}</button>
              <button type="button" disabled={save.isPending} onClick={() => submit('DRAFT')} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Save size={17} />Lưu bản nháp</button>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold">Thẻ bài viết</h2>
            <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onBlur={() => { if (tagInput.trim()) { setForm({ ...form, tags: [...new Set([...form.tags, ...tagInput.split(',').map((tag) => tag.trim()).filter(Boolean)])] }); setTagInput('') } }} className="mt-3 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" placeholder="Nhập các thẻ, cách nhau dấu phẩy" />
            <div className="mt-3 flex flex-wrap gap-2">{form.tags.map((tag) => <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((item) => item !== tag) })} key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">#{tag} ×</button>)}</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold">Tối ưu SEO</h2>
            <label className="mt-4 block"><span className="mb-1 block text-xs font-bold text-slate-600">Tiêu đề SEO</span><input value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} maxLength={180} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
            <label className="mt-3 block"><span className="mb-1 block text-xs font-bold text-slate-600">Mô tả SEO</span><textarea value={form.seoDescription} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} maxLength={320} rows={4} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400" /></label>
          </section>
        </aside>
      </div>
    </div>
  )
}
