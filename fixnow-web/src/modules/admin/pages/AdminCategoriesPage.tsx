import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Boxes, Pencil, Plus, Power, Trash2, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader } from '../components/AdminUi'
import { adminService } from '../services/adminService'
import type { AdminCategory } from '../types/adminTypes'

const categoryTypes = [
  { value: 'electrical', label: 'Điện' },
  { value: 'plumbing', label: 'Nước' },
  { value: 'hvac', label: 'Điều hòa' },
  { value: 'appliance', label: 'Thiết bị gia dụng' },
  { value: 'security', label: 'An ninh' },
  { value: 'painting', label: 'Sơn sửa' },
  { value: 'other', label: 'Khác' },
]

const cardTones = [
  { card: 'from-slate-50 via-white to-blue-50', icon: 'bg-blue-100 text-blue-700', accent: 'bg-blue-500', metric: 'bg-blue-50 text-blue-900' },
  { card: 'from-slate-50 via-white to-indigo-50', icon: 'bg-indigo-100 text-indigo-700', accent: 'bg-indigo-500', metric: 'bg-indigo-50 text-indigo-900' },
  { card: 'from-slate-50 via-white to-cyan-50', icon: 'bg-cyan-100 text-cyan-700', accent: 'bg-cyan-500', metric: 'bg-cyan-50 text-cyan-900' },
  { card: 'from-slate-50 via-white to-sky-50', icon: 'bg-sky-100 text-sky-700', accent: 'bg-sky-500', metric: 'bg-sky-50 text-sky-900' },
]

type CategoryForm = {
  name: string
  type: string
  description: string
  iconUrl: string
  isActive: boolean
}

const emptyForm: CategoryForm = {
  name: '',
  type: 'other',
  description: '',
  iconUrl: '',
  isActive: true,
}

function CategoryModal({
  category,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  category: AdminCategory | null
  isSaving: boolean
  error: string
  onClose: () => void
  onSubmit: (payload: CategoryForm) => void
}) {
  const [form, setForm] = useState<CategoryForm>(() => category ? {
    name: category.name,
    type: category.type,
    description: category.description || '',
    iconUrl: category.iconUrl || '',
    isActive: category.isActive,
  } : emptyForm)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const uploadIcon = async (file?: File) => {
    if (!file) return
    setUploadingIcon(true)
    setUploadError('')
    try {
      const iconUrl = await adminService.uploadCategoryIcon(file)
      setForm((current) => ({ ...current, iconUrl }))
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : 'Không thể tải biểu tượng lên.')
    } finally {
      setUploadingIcon(false)
    }
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) return
    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      iconUrl: form.iconUrl.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Danh mục dịch vụ</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
            <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin dùng để phân loại dịch vụ trên hệ thống.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
        </div>

        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Tên danh mục *</span>
            <input
              autoFocus
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ví dụ: Sửa chữa điện"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Loại danh mục</span>
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              {categoryTypes.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Trạng thái</span>
            <select
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(event) => setForm({ ...form, isActive: event.target.value === 'active' })}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Lưu trữ</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Biểu tượng danh mục</span>
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600">
                {form.iconUrl ? <img src={form.iconUrl} alt="Xem trước biểu tượng" className="h-full w-full object-contain p-3" /> : <Boxes size={30} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Chọn ảnh từ máy để làm biểu tượng.</p>
                <p className="mt-1 text-xs text-slate-500">Hỗ trợ PNG, JPG, WEBP và SVG. Nên dùng ảnh vuông, nền trong suốt.</p>
                {uploadError && <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className={`flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 ${uploadingIcon ? 'pointer-events-none opacity-60' : ''}`}>
                    <Upload size={16} />
                    {uploadingIcon ? 'Đang tải...' : form.iconUrl ? 'Đổi biểu tượng' : 'Tải biểu tượng'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={uploadingIcon}
                      onChange={(event) => uploadIcon(event.target.files?.[0])}
                    />
                  </label>
                  {form.iconUrl && (
                    <button type="button" onClick={() => setForm({ ...form, iconUrl: '' })} className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 hover:bg-red-100">
                      <Trash2 size={16} />Xóa ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Mô tả</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
              placeholder="Mô tả ngắn về nhóm dịch vụ..."
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Hủy</button>
          <button type="submit" disabled={isSaving || uploadingIcon || !form.name.trim()} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? 'Đang lưu...' : category ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function AdminCategoriesPage() {
  const client = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [formError, setFormError] = useState('')
  const categoriesQuery = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminService.getCategories })

  const saveCategory = useMutation({
    mutationFn: (payload: CategoryForm) => editingCategory
      ? adminService.updateCategory(editingCategory._id, payload)
      : adminService.createCategory(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setModalOpen(false)
      setEditingCategory(null)
      setFormError('')
    },
    onError: (error: Error) => setFormError(error.message || 'Không thể lưu danh mục.'),
  })

  const toggleCategory = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminService.updateCategory(id, { isActive }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })

  const openCreate = () => {
    setEditingCategory(null)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditingCategory(category)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saveCategory.isPending) return
    setModalOpen(false)
    setEditingCategory(null)
    setFormError('')
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Danh mục dịch vụ"
        description="Quản lý nhóm dịch vụ cùng số lượng dịch vụ Provider và yêu cầu phát sinh."
        actions={<button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><Plus size={18} />Thêm danh mục</button>}
      />

      {categoriesQuery.isLoading ? <AdminLoading /> : categoriesQuery.error || !categoriesQuery.data ? <AdminError /> : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {categoriesQuery.data.map((item, index) => {
            const tone = cardTones[index % cardTones.length]
            return (
              <article className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br ${tone.card} p-5 shadow-[0_16px_38px_-28px_rgba(30,64,175,.5)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_44px_-26px_rgba(30,64,175,.45)]`} key={item._id}>
                <span className={`absolute inset-x-0 top-0 h-1 ${tone.accent}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl ${tone.icon}`}>
                    {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-7 w-7 object-contain" /> : <Boxes size={23} />}
                  </span>
                  <div className="flex gap-1.5">
                    <button type="button" title="Chỉnh sửa danh mục" onClick={() => openEdit(item)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Pencil size={17} /></button>
                    <button type="button" title={item.isActive ? 'Lưu trữ danh mục' : 'Kích hoạt danh mục'} onClick={() => toggleCategory.mutate({ id: item._id, isActive: !item.isActive })} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Power size={17} /></button>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Danh mục dịch vụ</p>
                  <h2 className="mt-1.5 line-clamp-2 min-h-14 text-lg font-extrabold tracking-tight text-slate-900">{item.name}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{item.description || 'Chưa có mô tả cho danh mục này.'}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className={`rounded-2xl p-3 ${tone.metric}`}>
                    <p className="text-xl font-black">{item.serviceCount}</p>
                    <p className="text-[11px] font-medium leading-4 opacity-65">Dịch vụ Provider</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-800">
                    <p className="text-xl font-black">{item.requestCount}</p>
                    <p className="text-[11px] font-medium leading-4 text-slate-500">Yêu cầu đã tạo</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-slate-200/80 pt-4"><AdminBadge tone={item.isActive ? 'green' : 'slate'}>{item.isActive ? 'Đang hoạt động' : 'Đã lưu trữ'}</AdminBadge></div>
              </article>
            )
          })}
        </section>
      )}

      {modalOpen && (
        <CategoryModal
          key={editingCategory?._id || 'create'}
          category={editingCategory}
          isSaving={saveCategory.isPending}
          error={formError}
          onClose={closeModal}
          onSubmit={(payload) => saveCategory.mutate(payload)}
        />
      )}
    </div>
  )
}
