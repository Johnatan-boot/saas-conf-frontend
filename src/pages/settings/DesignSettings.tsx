import React, { useState, useEffect, useRef } from 'react'
import { Palette, Upload, Save, Eye, Instagram, Youtube, Copy, CheckCircle2, Globe, Link, Loader2, MapPin, ImagePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../../components/ui'
import { StoreTheme, DEFAULT_THEME } from '../../types/theme'
import { compressImageToBase64 } from '../../utils'
import { themeService } from '../../services/themeService'

function ColorField({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-mocha-400">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-cream-200 cursor-pointer p-0.5 bg-cream-50"
        />
        <input
          type="text" value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#6F4F37"
          className="input flex-1 font-mono text-sm"
        />
      </div>
    </div>
  )
}

export default function DesignSettings() {
  const [theme, setTheme] = useState<StoreTheme>(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerPreview, setBannerPreview] = useState('')
  const [bannerUploading, setBannerUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bannerFileRef = useRef<HTMLInputElement>(null)

  const catalogUrl = theme.slug
    ? `${window.location.origin}/catalogo/${theme.slug}`
    : null

  useEffect(() => {
    themeService.getTheme()
      .then(d => {
        setTheme(prev => ({ ...DEFAULT_THEME, ...d }))
        setLogoPreview(d?.logoUrl || '')
        setBannerPreview(d?.bannerUrl || '')
      })
      .catch(() => toast.error('Erro ao carregar configurações de design'))
      .finally(() => setLoading(false))
  }, [])

  const upd = (k: keyof StoreTheme, v: string) =>
    setTheme(prev => ({ ...prev, [k]: v }))

  // ── Logo selecionada: redimensiona + comprime antes de virar base64 ──
  // Mesma função usada nas fotos de produto. Evita o erro 413/500 que
  // acontecia ao enviar fotos de celular (3-5MB) sem compressão —
  // o JSON ficava maior que o limite de body do servidor.
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
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

    setLogoUploading(true)
    try {
      // Logo fica menor que foto de produto: 400px é mais que suficiente
      // para navbar/avatar e mantém o payload bem pequeno.
      const base64 = await compressImageToBase64(file, 400, 0.85)
      setLogoPreview(base64)
      setTheme(prev => ({ ...prev, logoUrl: base64 }))
      toast.success('Logo carregada! Clique em Salvar para confirmar.')
    } catch {
      toast.error('Erro ao carregar a imagem')
    } finally {
      setLogoUploading(false)
    }
  }

  // ── Banner do hero: comprime mantendo formato largo ───────────────
  // Imagem de referência típica: ~1792x600 (proporção ~3:1).
  // maxDim=1280 mantém boa nitidez em desktop sem pesar o payload.
  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB.')
      return
    }

    setBannerUploading(true)
    try {
      const base64 = await compressImageToBase64(file, 1280, 0.8)
      setBannerPreview(base64)
      setTheme(prev => ({ ...prev, bannerUrl: base64 }))
      toast.success('Banner carregado! Clique em Salvar para confirmar.')
    } catch {
      toast.error('Erro ao carregar a imagem')
    } finally {
      setBannerUploading(false)
      if (bannerFileRef.current) bannerFileRef.current.value = ''
    }
  }

  function removeBanner() {
    setBannerPreview('')
    upd('bannerUrl', '')
  }

  async function handleSave() {
    if (!theme.slug) {
      toast.error('Defina um slug para a URL do catálogo antes de salvar.')
      return
    }
    setSaving(true)
    try {
      await themeService.saveTheme(theme)
      toast.success('Design salvo com sucesso! ✅')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao salvar'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  function copyLink() {
    if (!catalogUrl) return
    navigator.clipboard.writeText(catalogUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copiado!')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl animate-pulse">🎨</div>
        <p className="text-mocha-500 text-sm">Carregando configurações...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-chocolate-600" /> Design da Loja
          </h2>
          <p className="text-mocha-500 text-sm mt-1">
            Personalize a aparência do catálogo público da sua confeitaria
          </p>
        </div>
        <div className="flex gap-2">
          {catalogUrl && (
            <a href={catalogUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" icon={<Eye size={16} />}>Visualizar</Button>
            </a>
          )}
          <Button onClick={handleSave} loading={saving} icon={<Save size={16} />}>
            Salvar
          </Button>
        </div>
      </div>

      {/* Link do catálogo */}
      {catalogUrl && (
        <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-sage-700 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Globe size={12} /> Link do catálogo público
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-sage-800 bg-white px-3 py-2 rounded-xl border border-sage-200 truncate font-mono">
              {catalogUrl}
            </code>
            <button
              onClick={copyLink}
              className="p-2 rounded-xl bg-sage-600 text-white hover:bg-sage-700 transition flex-shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-sage-600 mt-2">
            Compartilhe com seus clientes. Só aparecem produtos com estoque disponível.
          </p>
        </div>
      )}

      {/* Banner do Catálogo */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-mocha-900 flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-chocolate-600" /> Banner do Catálogo
          </h3>
          {bannerPreview && (
            <button
              type="button"
              onClick={removeBanner}
              className="text-xs text-red-400 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Remover
            </button>
          )}
        </div>
        <p className="text-xs text-mocha-400">
          Aparece como imagem de fundo na seção "Nosso Cardápio", logo abaixo do menu.
          Recomendado: imagem larga (proporção ~3:1, ex: 1792×600px).
        </p>
        <div
          onClick={() => !bannerUploading && bannerFileRef.current?.click()}
          className="w-full aspect-[3/1] rounded-2xl border-2 border-dashed border-cream-300 flex items-center justify-center overflow-hidden bg-cream-50 cursor-pointer hover:border-chocolate-400 transition relative"
        >
          {bannerUploading ? (
            <Loader2 className="w-6 h-6 text-mocha-400 animate-spin" />
          ) : bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-mocha-400">
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Clique para escolher uma imagem</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => bannerFileRef.current?.click()}
          className="text-sm text-chocolate-600 font-medium hover:underline"
        >
          {bannerPreview ? 'Trocar banner' : 'Escolher imagem'}
        </button>
        <input
          ref={bannerFileRef} type="file" accept="image/*"
          className="hidden" onChange={handleBannerChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna: Identidade */}
        <div className="card space-y-5">
          <h3 className="font-display font-semibold text-mocha-900 border-b border-cream-100 pb-3">
            Identidade da Loja
          </h3>

          {/* Logo */}
          <div>
            <label className="label">Logo da loja</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => !logoUploading && fileRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-cream-300 flex items-center justify-center overflow-hidden bg-cream-50 cursor-pointer hover:border-chocolate-400 transition"
              >
                {logoUploading ? (
                  <Loader2 className="w-6 h-6 text-mocha-400 animate-spin" />
                ) : logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Upload className="w-6 h-6 text-mocha-400" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-chocolate-600 font-medium hover:underline"
                >
                  {logoPreview ? 'Trocar imagem' : 'Escolher imagem'}
                </button>
                <p className="text-xs text-mocha-400 mt-1">PNG, JPG ou SVG. Máx 2MB.</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoPreview(''); upd('logoUrl', '') }}
                    className="text-xs text-red-400 hover:underline mt-1 block"
                  >
                    Remover logo
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handleLogoChange}
            />
          </div>

          <div>
            <label className="label">Nome da loja</label>
            <input
              type="text" value={theme.storeName}
              onChange={e => upd('storeName', e.target.value)}
              placeholder="Ex: Confeitaria da Maria"
              className="input"
            />
          </div>

          <div>
            <label className="label">Slogan / Tagline</label>
            <input
              type="text" value={theme.tagline}
              onChange={e => upd('tagline', e.target.value)}
              placeholder="Ex: Doces que contam histórias"
              className="input"
            />
          </div>

          <div>
            <label className="label">Sobre a loja</label>
            <textarea
              value={theme.aboutText}
              onChange={e => upd('aboutText', e.target.value)}
              placeholder="Conte um pouco sobre a história da sua confeitaria, o que vocês fazem de especial..."
              rows={4}
              className="input resize-y min-h-[100px]"
            />
            <p className="text-xs text-mocha-400 mt-1">
              Aparece na seção "Sobre" do catálogo. Deixe em branco para ocultar essa seção.
            </p>
          </div>

          <div>
            <label className="label flex items-center gap-1">
              <Globe size={14} /> URL do catálogo *
            </label>
            <div className="flex items-center">
              <span className="text-xs text-mocha-400 bg-cream-100 px-2 py-2.5 rounded-l-xl border border-r-0 border-cream-200 whitespace-nowrap">
                /catalogo/
              </span>
              <input
                type="text" value={theme.slug}
                onChange={e => upd('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'))}
                placeholder="minha-confeitaria"
                className="input rounded-l-none flex-1"
              />
            </div>
            <p className="text-xs text-mocha-400 mt-1">
              Só letras minúsculas, números e hífens. Ex: confeitaria-da-maria
            </p>
          </div>
        </div>

        {/* Coluna: Cores */}
        <div className="card space-y-5">
          <h3 className="font-display font-semibold text-mocha-900 border-b border-cream-100 pb-3">
            Paleta de Cores
          </h3>

          <ColorField
            label="Cor principal (Navbar & Botões)"
            value={theme.primaryColor}
            onChange={v => upd('primaryColor', v)}
            hint="Usada no header e botões de ação"
          />
          <ColorField
            label="Cor de destaque"
            value={theme.secondaryColor}
            onChange={v => upd('secondaryColor', v)}
            hint="Badges, preços e elementos secundários"
          />
          <ColorField
            label="Cor de fundo da página"
            value={theme.backgroundColor}
            onChange={v => upd('backgroundColor', v)}
          />
          <ColorField
            label="Cor do texto"
            value={theme.textColor}
            onChange={v => upd('textColor', v)}
          />
          <ColorField
            label="Fundo dos cards de produto"
            value={theme.cardColor}
            onChange={v => upd('cardColor', v)}
          />

          {/* Preview ao vivo */}
          <div className="rounded-xl overflow-hidden border border-cream-200 text-xs">
            <div className="p-3 flex items-center gap-2" style={{ backgroundColor: theme.primaryColor }}>
              {logoPreview && (
                <img src={logoPreview} alt="" className="w-6 h-6 rounded object-contain" />
              )}
              <span className="text-white font-bold">{theme.storeName || 'Preview'}</span>
            </div>
            <div className="p-3" style={{ backgroundColor: theme.backgroundColor }}>
              <div className="rounded-xl p-3" style={{ backgroundColor: theme.cardColor }}>
                <p className="font-semibold" style={{ color: theme.textColor }}>🎂 Bolo de Chocolate</p>
                <p className="font-bold mt-1" style={{ color: theme.secondaryColor }}>R$ 89,90</p>
                <div
                  className="mt-2 px-3 py-1 rounded-xl text-center text-white font-medium"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Adicionar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redes Sociais & Contato */}
      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-mocha-900 border-b border-cream-100 pb-3 flex items-center gap-2">
          <Link size={16} /> Redes Sociais & Contato
        </h3>
        <p className="text-sm text-mocha-500">
          Aparecem na seção "Contato" e no rodapé do catálogo público.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label flex items-center gap-1">
              <MapPin size={14} className="text-chocolate-500" /> Endereço
            </label>
            <input
              type="text" value={theme.address}
              onChange={e => upd('address', e.target.value)}
              placeholder="Ex: Rua das Flores, 123 - Centro, Sua Cidade"
              className="input"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Instagram size={14} className="text-pink-500" /> Instagram
            </label>
            <input
              type="url" value={theme.instagram}
              onChange={e => upd('instagram', e.target.value)}
              placeholder="https://instagram.com/suaconfeitaria"
              className="input"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </label>
            <input
              type="url" value={theme.facebook}
              onChange={e => upd('facebook', e.target.value)}
              placeholder="https://facebook.com/suaconfeitaria"
              className="input"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp (número)
            </label>
            <input
              type="tel" value={theme.whatsapp}
              onChange={e => upd('whatsapp', e.target.value.replace(/\D/g, ''))}
              placeholder="5511999999999"
              className="input"
            />
            <p className="text-xs text-mocha-400 mt-1">DDI + DDD + número. Ex: 5511987654321</p>
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Youtube size={14} className="text-red-500" /> YouTube
            </label>
            <input
              type="url" value={theme.youtube}
              onChange={e => upd('youtube', e.target.value)}
              placeholder="https://youtube.com/@suaconfeitaria"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Botão salvar fixo mobile */}
      <div className="sticky bottom-4 flex justify-end sm:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-chocolate-700 text-white rounded-full shadow-lg text-sm font-medium transition disabled:opacity-60"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            : <><Save className="w-4 h-4" /> Salvar</>}
        </button>
      </div>
    </div>
  )
}
