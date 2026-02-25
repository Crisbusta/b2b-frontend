import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listTemplates } from '../api/client'
import type { Template } from '../types/dto'
import type { ReactNode } from 'react'

/* ── Category SVG icons ──────────────────────────────── */
const CatIconPipe = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>
    <line x1="12" y1="3" x2="12" y2="7.5"/><line x1="12" y1="16.5" x2="12" y2="21"/>
  </svg>
)

const CatIconValve = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="4" rx="2"/>
    <circle cx="7.5" cy="12" r="2.5"/><circle cx="16.5" cy="12" r="2.5"/>
    <line x1="12" y1="6" x2="12" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/>
  </svg>
)

const CatIconCable = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)

const CatIconSteel = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4v16M19 4v16"/>
    <path d="M5 4h5M14 4h5M5 20h5M14 20h5"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const CatIconConcrete = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const CatIconGeo = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

/* ── General icons ───────────────────────────────────── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)

const IconSpinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

/* ── Category metadata ───────────────────────────────── */
export const CATEGORY_META: Record<string, { icon: ReactNode; color: string; desc: string; tags: string[] }> = {
  pipe_pead_thermofusion: {
    icon:  <CatIconPipe />,
    color: '#DBEAFE',
    desc:  'Tuberías de polietileno de alta densidad para sistemas de agua potable, riego y saneamiento.',
    tags:  ['Tuberías', 'PEAD', 'Agua', 'Infraestructura'],
  },
  valvula_compuerta_acero: {
    icon:  <CatIconValve />,
    color: '#FEF3C7',
    desc:  'Válvulas de compuerta en acero al carbono e inoxidable para fluidos industriales.',
    tags:  ['Válvulas', 'Acero', 'Mecánica', 'Fluidos'],
  },
  cable_electrico_mt: {
    icon:  <CatIconCable />,
    color: '#FDE68A',
    desc:  'Cables de energía para sistemas de distribución en media tensión 6–33 kV.',
    tags:  ['Eléctrico', 'Media tensión', 'Energía', 'Minería'],
  },
  perfil_acero_estructural: {
    icon:  <CatIconSteel />,
    color: '#E2E8F0',
    desc:  'Perfiles estructurales HEB, HEA, IPE y UPN para obras civiles e industriales.',
    tags:  ['Acero', 'Estructural', 'Construcción', 'Perfil'],
  },
  hormigon_premezclado: {
    icon:  <CatIconConcrete />,
    color: '#F3F4F6',
    desc:  'Hormigón premezclado de diversas resistencias para fundaciones, losas y elementos estructurales.',
    tags:  ['Hormigón', 'Concreto', 'Obra civil', 'Fundaciones'],
  },
  geomembrana_hdpe: {
    icon:  <CatIconGeo />,
    color: '#D1FAE5',
    desc:  'Geomembranas HDPE para impermeabilización de tranques, canales y rellenos sanitarios.',
    tags:  ['Geosintéticos', 'Impermeabilización', 'Minería', 'Ambiental'],
  },
}

const ALL_TAGS = Array.from(new Set(Object.values(CATEGORY_META).flatMap(m => m.tags)))

/* ── Contact form state ──────────────────────────────── */
interface ContactFormState {
  name: string; company: string; email: string
  phone: string; message: string
  submitting: boolean; sent: boolean; error: string
}

function initialForm(): ContactFormState {
  return { name: '', company: '', email: '', phone: '', message: '', submitting: false, sent: false, error: '' }
}

/* ── Component ───────────────────────────────────────── */
export default function CatalogPage() {
  const navigate = useNavigate()
  const role     = localStorage.getItem('userRole') ?? ''
  const isBuyer  = role === 'buyer_user' || role === 'company_admin'

  const [templates,     setTemplates]     = useState<Template[]>([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [activeTag,     setActiveTag]     = useState<string | null>(null)
  const [selected,      setSelected]      = useState<string | null>(null)
  const [contactForms,  setContactForms]  = useState<Record<string, ContactFormState>>({})

  useEffect(() => {
    listTemplates().then(setTemplates).finally(() => setLoading(false))
  }, [])

  const filtered = templates.filter(t => {
    const meta = CATEGORY_META[t.categoryKey]
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      meta?.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchTag = !activeTag || meta?.tags.includes(activeTag)
    return matchSearch && matchTag
  })

  function handleSelect(key: string) {
    const next = selected === key ? null : key
    setSelected(next)
    if (next && !contactForms[key]) {
      setContactForms(p => ({ ...p, [key]: initialForm() }))
    }
  }

  function updateForm(key: string, field: 'name' | 'company' | 'email' | 'phone' | 'message', value: string) {
    setContactForms(p => ({ ...p, [key]: { ...(p[key] ?? initialForm()), [field]: value } }))
  }

  async function submitContact(key: string) {
    const form = contactForms[key]
    if (!form) return
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setContactForms(p => ({ ...p, [key]: { ...p[key], error: 'Nombre, email y mensaje son requeridos' } }))
      return
    }
    setContactForms(p => ({ ...p, [key]: { ...p[key], submitting: true, error: '' } }))
    // Mock API call
    await new Promise(r => setTimeout(r, 800))
    console.log('Contact form submitted for', key, form)
    setContactForms(p => ({ ...p, [key]: { ...p[key], submitting: false, sent: true } }))
  }

  function handleCTA(e: React.MouseEvent, t: Template) {
    e.stopPropagation()
    if (isBuyer) navigate(`/rfqs/new?category=${t.categoryKey}`)
    else navigate('/rfqs')
  }

  return (
    <div>
      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vitrina de Proveedores</h1>
          <p className="page-subtitle">
            Explora categorías y conecta con proveedores certificados — {templates.length} categorías activas
          </p>
        </div>
        {isBuyer && (
          <button className="btn btn-accent" onClick={() => navigate('/rfqs/new')}>
            + Nueva RFQ
          </button>
        )}
      </div>

      {/* ── Search + filters ─────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <div className="input-with-icon" style={{ flex: '1 1 300px' }}>
            <span className="icon-prefix"><IconSearch /></span>
            <input
              className="form-input"
              placeholder="Buscar por nombre o tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tag filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`filter-tab ${!activeTag ? 'active' : ''}`} onClick={() => setActiveTag(null)}>
            Todos
          </button>
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              className={`filter-tab ${activeTag === tag ? 'active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className="skeleton-card" style={{ height: 200 }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
              <div className="skeleton" style={{ width: '70%', height: 18, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '90%', height: 14, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '80%', height: 14 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconSearch /></div>
            <div className="empty-state-title">Sin resultados</div>
            <div className="empty-state-desc">Intenta con otro término de búsqueda o limpia los filtros.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(t => {
            const meta      = CATEGORY_META[t.categoryKey] ?? { icon: null, color: '#E2E8F0', desc: '', tags: [] }
            const isOpen    = selected === t.categoryKey
            const form      = contactForms[t.categoryKey]

            return (
              <div
                key={t.categoryKey}
                className={`vitrina-card${isOpen ? ' selected' : ''}`}
                onClick={() => handleSelect(t.categoryKey)}
              >
                {/* Card header */}
                <div className="vitrina-card-header">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 54, height: 54, flexShrink: 0,
                      background: meta.color, borderRadius: 'var(--radius-lg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t.attributes.length} atributos · {t.attributes.filter(a => a.required).length} requeridos
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                      {isOpen ? <IconChevronUp /> : <IconChevronDown />}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="vitrina-card-body">
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px' }}>
                    {meta.desc}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {meta.tags.map(tag => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 20,
                        fontSize: 11, fontWeight: 600,
                        background: 'var(--bg)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}>
                        <IconTag />{tag}
                      </span>
                    ))}
                  </div>

                  {/* Expanded: specifications */}
                  {isOpen && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                          Especificaciones técnicas
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {t.attributes.map(attr => (
                            <div key={attr.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                              <span style={{ color: attr.required ? 'var(--danger)' : 'var(--text-light)', fontSize: 10, lineHeight: '20px', flexShrink: 0 }}>
                                {attr.required ? '●' : '○'}
                              </span>
                              <div>
                                <span style={{ fontWeight: 600 }}>{attr.label}</span>
                                {attr.unit && <span style={{ color: 'var(--text-muted)' }}> ({attr.unit})</span>}
                                {attr.type === 'enum' && attr.enumValues && (
                                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                                    {attr.enumValues.join(' · ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact section */}
                      {isBuyer ? (
                        <div onClick={e => e.stopPropagation()}>
                          {form?.sent ? (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '14px 16px', borderRadius: 8,
                              background: 'var(--success-bg)', border: '1px solid var(--success)',
                            }}>
                              <span style={{ color: 'var(--success)' }}><IconCheck /></span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--success)' }}>Consulta enviada</div>
                                <div style={{ fontSize: 12, color: '#047857' }}>Te contactaremos pronto con información de proveedores.</div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>
                                Solicitar información de proveedores
                              </div>
                              {form?.error && (
                                <div className="alert alert-error" style={{ padding: '8px 12px', fontSize: 12, marginBottom: 10 }}>
                                  {form.error}
                                </div>
                              )}
                              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>
                                    Nombre <span className="required">*</span>
                                  </label>
                                  <input
                                    className="form-input"
                                    style={{ fontSize: 13, padding: '7px 10px' }}
                                    placeholder="Tu nombre"
                                    value={form?.name ?? ''}
                                    onChange={e => updateForm(t.categoryKey, 'name', e.target.value)}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Empresa</label>
                                  <input
                                    className="form-input"
                                    style={{ fontSize: 13, padding: '7px 10px' }}
                                    placeholder="Nombre empresa"
                                    value={form?.company ?? ''}
                                    onChange={e => updateForm(t.categoryKey, 'company', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>
                                    Email <span className="required">*</span>
                                  </label>
                                  <input
                                    className="form-input"
                                    style={{ fontSize: 13, padding: '7px 10px' }}
                                    type="email"
                                    placeholder="tu@empresa.com"
                                    value={form?.email ?? ''}
                                    onChange={e => updateForm(t.categoryKey, 'email', e.target.value)}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Teléfono</label>
                                  <input
                                    className="form-input"
                                    style={{ fontSize: 13, padding: '7px 10px' }}
                                    placeholder="+56 9..."
                                    value={form?.phone ?? ''}
                                    onChange={e => updateForm(t.categoryKey, 'phone', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>
                                  Mensaje <span className="required">*</span>
                                </label>
                                <textarea
                                  className="form-textarea"
                                  style={{ fontSize: 13, padding: '7px 10px', minHeight: 72, resize: 'vertical' }}
                                  placeholder="Describe tu necesidad de abastecimiento..."
                                  value={form?.message ?? ''}
                                  onChange={e => updateForm(t.categoryKey, 'message', e.target.value)}
                                />
                              </div>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => submitContact(t.categoryKey)}
                                disabled={form?.submitting}
                              >
                                {form?.submitting ? <><IconSpinner /> Enviando...</> : <><IconSend /> Solicitar información</>}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px', borderRadius: 8,
                          background: 'var(--purple-bg)', border: '1px solid #C4B5FD',
                        }}>
                          <span style={{ color: 'var(--purple)', fontSize: 12 }}>●</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--purple)' }}>Eres proveedor de esta categoría</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              <a href="/rfqs" style={{ color: 'var(--purple)', fontWeight: 600 }} onClick={e => { e.stopPropagation(); navigate('/rfqs') }}>
                                Ver invitaciones activas →
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card action */}
                <div className="vitrina-card-action" onClick={e => handleCTA(e, t)}>
                  <button
                    className={`btn btn-sm ${isBuyer ? 'btn-primary' : 'btn-outline-primary'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {isBuyer ? 'Crear RFQ con esta categoría' : 'Ver RFQs de esta categoría'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
