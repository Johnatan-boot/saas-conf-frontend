import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, AlertTriangle, Package, Tag, ImagePlus, X, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../services/api'
import { Product, Category } from '../types'
import { formatCurrency } from '../utils'
import { LoadingPage, Modal, Button, Input, Select, Textarea, EmptyState, ConfirmDialog, Table, Badge } from '../components/ui'
import toast from 'react-hot-toast'

// ── Comprime e converte a imagem escolhida em base64 (JPEG) ──────
// Evita salvar fotos gigantes no banco: redimensiona para no
// máximo 800px no lado maior e comprime a 82% de qualidade.
function compressImageToBase64(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim }
          else { width = Math.round(width * (maxDim / height)); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas não suportado neste navegador'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Arquivo de imagem inválido'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState<'list' | 'chart'>('list')
  const [imageProcessing, setImageProcessing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', description: '', price: '', cost_price: '', unit: 'unidade',
    stock: '0', min_stock: '0', is_active: true, category_id: '', image_url: ''
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [proRes, lowRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/low-stock'),
        api.get('/categories'),
      ])
      setProducts(proRes.data.data)
      setLowStock(lowRes.data.data)
      setCategories(catRes.data.data)
    } catch { toast.error('Erro ao carregar produtos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setSelected(null)
    setForm({
      name: '', description: '', price: '', cost_price: '', unit: 'unidade',
      stock: '0', min_stock: '0', is_active: true,
      category_id: categories[0] ? String(categories[0].id) : '',
      image_url: '',
    })
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setSelected(p)
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      cost_price: String(p.cost_price || ''), unit: p.unit, stock: String(p.stock),
      min_stock: String(p.min_stock), is_active: p.is_active,
      category_id: p.category_id ? String(p.category_id) : '',
      image_url: p.image_url || '',
    })
    setModalOpen(true)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 8MB.')
      return
    }

    setImageProcessing(true)
    try {
      const base64 = await compressImageToBase64(file)
      setForm(f => ({ ...f, image_url: base64 }))
    } catch {
      toast.error('Não foi possível processar a imagem')
    } finally {
      setImageProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeImage() {
    setForm(f => ({ ...f, image_url: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        cost_price: form.cost_price ? Number(form.cost_price) : undefined,
        stock: Number(form.stock),
        min_stock: Number(form.min_stock),
        category_id: form.category_id ? Number(form.category_id) : undefined,
      }
      if (selected) {
        await api.put(`/products/${selected.id}`, payload)
        toast.success('Produto atualizado!')
      } else {
        await api.post('/products', payload)
        toast.success('Produto criado!')
      }
      setModalOpen(false)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/products/${deleteId}`)
      toast.success('Produto removido')
      setDeleteId(null)
      load()
    } catch { toast.error('Erro ao excluir') }
    finally { setDeleting(false) }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !categoryFilter || String(p.category_id) === categoryFilter
    return matchSearch && matchCategory
  })

  const margin = (p: Product) => {
    if (!p.cost_price || !p.price) return null
    return (((Number(p.price) - Number(p.cost_price)) / Number(p.price)) * 100).toFixed(0)
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Produtos</h2>
          <p className="text-mocha-500 text-sm">{products.length} produto(s) cadastrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(v => v === 'list' ? 'chart' : 'list')}
            className="btn-secondary text-sm flex items-center gap-2">
            {view === 'list' ? '📊 Gráfico' : '📋 Lista'}
          </button>
          <Button onClick={openNew} icon={<Plus size={16} />}>Novo Produto</Button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-800">{lowStock.length} produto(s) com estoque baixo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p.id} className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">
                {p.name}: {p.stock} un
              </span>
            ))}
          </div>
        </div>
      )}

      {view === 'chart' && products.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4">Estoque por Produto</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products.slice(0, 12).map(p => ({ name: p.name.slice(0, 16), stock: p.stock, min: p.min_stock }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9a7e5a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} />
              <Tooltip contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12 }} />
              <Bar dataKey="stock" fill="#6F4F37" radius={[4, 4, 0, 0]} name="Estoque" />
              <Bar dataKey="min" fill="#D4B896" radius={[4, 4, 0, 0]} name="Mínimo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Busca + filtro de categoria */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
            className="input pl-10 w-full" />
        </div>
        <div className="relative w-full sm:w-56">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400 pointer-events-none z-10" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input pl-10 w-full appearance-none"
          >
            <option value="">Todas as categorias</option>
            {categories.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" action={<Button onClick={openNew} icon={<Plus size={16} />}>Novo Produto</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const m = margin(p)
            const isLow = p.stock <= p.min_stock
            return (
              <div key={p.id} className="card card-hover group relative overflow-hidden">
                {/* status strip */}
                <div className={`absolute top-0 left-0 w-1 h-full ${p.is_active ? 'bg-green-400' : 'bg-mocha-300'}`} />
                <div className="pl-3 flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100 flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-cream-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-mocha-900 truncate">{p.name}</h4>
                        {p.category_name && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-chocolate-600 bg-chocolate-50 px-2 py-0.5 rounded-full mt-1">
                            <Tag size={10} /> {p.category_name}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-cream-100 text-mocha-500"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-xl font-bold text-chocolate-700">{formatCurrency(Number(p.price))}</span>
                      {m && <Badge variant="success">Margem {m}%</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isLow ? 'text-yellow-600' : 'text-sage-700'}`}>
                          {isLow && '⚠️ '}{p.stock} {p.unit}
                        </span>
                        {p.min_stock > 0 && <span className="text-mocha-300 text-xs">/ mín {p.min_stock}</span>}
                      </div>
                      {!p.is_active && <Badge variant="warning">Inativo</Badge>}
                    </div>
                    {/* Stock bar */}
                    {p.min_stock > 0 && (
                      <div className="mt-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isLow ? 'bg-yellow-400' : 'bg-sage-400'}`}
                          style={{ width: `${Math.min(100, (p.stock / (p.min_stock * 3)) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Editar Produto' : 'Novo Produto'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Upload de imagem */}
          <div>
            <label className="label">Foto do produto</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => !imageProcessing && fileRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-cream-300 flex items-center justify-center overflow-hidden bg-cream-50 cursor-pointer hover:border-chocolate-400 transition flex-shrink-0 relative"
              >
                {imageProcessing ? (
                  <Loader2 className="w-6 h-6 text-mocha-400 animate-spin" />
                ) : form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-mocha-400" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-chocolate-600 font-medium hover:underline"
                >
                  {form.image_url ? 'Trocar foto' : 'Escolher foto'}
                </button>
                <p className="text-xs text-mocha-400 mt-1">JPG, PNG ou WEBP. Será otimizada automaticamente.</p>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs text-red-400 hover:underline mt-1 flex items-center gap-1"
                  >
                    <X size={12} /> Remover foto
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handleImageChange}
            />
          </div>

          <Input label="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Bolo de Chocolate" />
          <Textarea label="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva o produto..." />

          <Select
            label="Categoria"
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            options={[
              { value: '', label: 'Sem categoria' },
              ...categories.map(c => ({ value: String(c.id), label: c.name })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Preço de venda (R$) *" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            <Input label="Custo (R$)" type="number" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} />
            <Input label="Estoque" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            <Input label="Estoque mínimo" type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} />
            <Select label="Unidade" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              options={['unidade', 'par', 'caixa', 'kg', 'g', 'dúzia'].map(v => ({ value: v, label: v }))} />
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-chocolate-700" />
              <label htmlFor="active" className="text-sm text-mocha-700">Produto ativo</label>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{selected ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Excluir Produto" message="Tem certeza? Esta ação não pode ser desfeita." loading={deleting} />
    </div>
  )
}
