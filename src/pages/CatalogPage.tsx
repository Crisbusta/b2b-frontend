import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { listTemplates } from '../api/client'
import type { Template } from '../types/dto'
import type { ReactNode } from 'react'

/* ── Category metadata ───────────────────────────────── */
export const CATEGORY_META: Record<string, { icon: ReactNode; color: string; desc: string; tags: string[]; featured?: boolean; verified?: boolean }> = {
  pipe_pead_thermofusion: {
    icon:     <span className="mat-icon" style={{ fontSize: 26, color: '#2563EB' }}>plumbing</span>,
    color:    '#DBEAFE',
    desc:     'Tuberías de polietileno de alta densidad para sistemas de agua potable, riego y saneamiento.',
    tags:     ['Tuberías', 'PEAD', 'Agua', 'Infraestructura'],
    featured: true,
    verified: true,
  },
  valvula_compuerta_acero: {
    icon:     <span className="mat-icon" style={{ fontSize: 26, color: '#B45309' }}>settings_input_component</span>,
    color:    '#FEF3C7',
    desc:     'Válvulas de compuerta en acero al carbono e inoxidable para fluidos industriales.',
    tags:     ['Válvulas', 'Acero', 'Mecánica', 'Fluidos'],
    featured: true,
  },
  cable_electrico_mt: {
    icon:     <span className="mat-icon" style={{ fontSize: 26, color: '#92400E' }}>cable</span>,
    color:    '#FDE68A',
    desc:     'Cables de energía para sistemas de distribución en media tensión 6–33 kV.',
    tags:     ['Eléctrico', 'Media tensión', 'Energía', 'Minería'],
    featured: true,
    verified: true,
  },
  perfil_acero_estructural: {
    icon:  <span className="mat-icon" style={{ fontSize: 26, color: '#475569' }}>architecture</span>,
    color: '#E2E8F0',
    desc:  'Perfiles estructurales HEB, HEA, IPE y UPN para obras civiles e industriales.',
    tags:  ['Acero', 'Estructural', 'Construcción', 'Perfil'],
  },
  hormigon_premezclado: {
    icon:  <span className="mat-icon" style={{ fontSize: 26, color: '#6B7280' }}>foundation</span>,
    color: '#F3F4F6',
    desc:  'Hormigón premezclado de diversas resistencias para fundaciones, losas y elementos estructurales.',
    tags:  ['Hormigón', 'Concreto', 'Obra civil', 'Fundaciones'],
  },
  geomembrana_hdpe: {
    icon:  <span className="mat-icon" style={{ fontSize: 26, color: '#047857' }}>layers</span>,
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

  const [templates,    setTemplates]    = useState<Template[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [activeTag,    setActiveTag]    = useState<string | null>(null)
  const [selected,     setSelected]     = useState<string | null>(null)
  const [contactForms, setContactForms] = useState<Record<string, ContactFormState>>({})

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

  const featuredFiltered = filtered.filter(t => CATEGORY_META[t.categoryKey]?.featured).slice(0, 3)
  const regularFiltered  = filtered.filter(t => !CATEGORY_META[t.categoryKey]?.featured)

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
    await new Promise(r => setTimeout(r, 800))
    console.log('Contact form submitted for', key, form)
    setContactForms(p => ({ ...p, [key]: { ...p[key], submitting: false, sent: true } }))
  }

  function handleCTA(e: React.MouseEvent, t: Template) {
    e.stopPropagation()
    if (isBuyer) navigate(`/rfqs/new?category=${t.categoryKey}`)
    else navigate('/rfqs')
  }

  function renderCard(t: Template) {
    const meta   = CATEGORY_META[t.categoryKey] ?? { icon: null, color: '#E2E8F0', desc: '', tags: [] }
    const isOpen = selected === t.categoryKey
    const form   = contactForms[t.categoryKey]

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
              transition: 'background var(--transition-base)',
            }}>
              {meta.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link
              to={`/catalog/${t.categoryKey}`}
              style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 3, display: 'block', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {t.name}
            </Link>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t.attributes.length} atributos · {t.attributes.filter(a => a.required).length} requeridos
              </div>
              {(meta.featured || meta.verified) && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {meta.featured && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                      <span className="mat-icon mat-icon-filled" style={{ fontSize: 11, color: '#D97706' }}>star</span> Destacado
                    </span>
                  )}
                  {meta.verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#FEF9C3', color: '#854D0E', border: '1px solid #FDE047' }}>
                      <span className="mat-icon mat-icon-filled" style={{ fontSize: 11, color: '#059669' }}>verified</span> Verificado
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <span className="mat-icon" style={{ fontSize: 18 }}>{isOpen ? 'expand_less' : 'expand_more'}</span>
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
                <span className="mat-icon" style={{ fontSize: 12 }}>label</span>{tag}
              </span>
            ))}
          </div>

          {/* Expanded content */}
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

              {/* Contact / supplier section */}
              {isBuyer ? (
                <div onClick={e => e.stopPropagation()}>
                  {form?.sent ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 16px', borderRadius: 8,
                      background: 'var(--success-bg)', border: '1px solid var(--success)',
                    }}>
                      <span style={{ color: 'var(--success)' }}><span className="mat-icon">check_circle</span></span>
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
                        {form?.submitting
                          ? <><span className="mat-icon icon-spin" style={{ fontSize: 15 }}>refresh</span> Enviando...</>
                          : <><span className="mat-icon" style={{ fontSize: 15 }}>send</span> Solicitar información</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 8,
                    background: 'var(--purple-bg)', border: '1px solid #C4B5FD',
                  }}>
                    <span className="mat-icon mat-icon-filled" style={{ fontSize: 16, color: 'var(--purple)' }}>verified_user</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--purple)' }}>Eres proveedor de esta categoría</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        <a href="/rfqs" style={{ color: 'var(--purple)', fontWeight: 600 }} onClick={e => { e.stopPropagation(); navigate('/rfqs') }}>
                          Ver invitaciones activas →
                        </a>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Actividad reciente
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>12</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingBottom: 4, lineHeight: 1.3 }}>compradores vieron esta categoría esta semana</span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 10px', borderRadius: 6,
                      background: 'var(--border)', cursor: 'not-allowed',
                    }}>
                      <span className="mat-icon" style={{ fontSize: 14, color: 'var(--text-muted)' }}>lock</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                        Activa Analytics Pro para ver el detalle completo
                      </span>
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
            <span className="mat-icon" style={{ fontSize: 18 }}>add</span> Nueva RFQ
          </button>
        )}
      </div>

      {/* ── Main layout: sidebar + content ───────────────── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="catalog-sidebar">
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mat-icon" style={{ fontSize: 16 }}>filter_list</span>
                Filtros
              </div>
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Categoría filter */}
            <div className="catalog-filter-section">
              <div className="catalog-filter-section-title">Categoría</div>
              <button
                className={`catalog-filter-item${!activeTag ? ' active' : ''}`}
                onClick={() => setActiveTag(null)}
              >
                <span className="mat-icon" style={{ fontSize: 16 }}>apps</span>
                Todas
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>{templates.length}</span>
              </button>
              {ALL_TAGS.map(tag => {
                const count = templates.filter(t => CATEGORY_META[t.categoryKey]?.tags.includes(tag)).length
                return (
                  <button
                    key={tag}
                    className={`catalog-filter-item${activeTag === tag ? ' active' : ''}`}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    <span className="mat-icon" style={{ fontSize: 14 }}>label</span>
                    {tag}
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* CTA card */}
            {isBuyer && (
              <div style={{
                marginTop: 8, padding: '14px', borderRadius: 'var(--radius)',
                background: 'var(--primary-light)', border: '1px solid var(--primary-100)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
                  ¿Necesitas cotización?
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                  Crea una RFQ y recibe precios de proveedores certificados.
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                  onClick={() => navigate('/rfqs/new')}
                >
                  <span className="mat-icon" style={{ fontSize: 14 }}>add</span> Nueva RFQ
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search + result count */}
          <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="input-with-icon" style={{ flex: '1 1 260px' }}>
              <span className="icon-prefix"><span className="mat-icon" style={{ fontSize: 16 }}>search</span></span>
              <input
                className="form-input"
                placeholder="Buscar por nombre o categoría..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
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
                <div className="empty-state-icon">
                  <span className="mat-icon mat-icon-lg">search_off</span>
                </div>
                <div className="empty-state-title">Sin resultados</div>
                <div className="empty-state-desc">Intenta con otro término de búsqueda o limpia los filtros.</div>
              </div>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featuredFiltered.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <span className="mat-icon mat-icon-filled" style={{ fontSize: 14, color: '#D97706' }}>star</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Proveedores Destacados</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>· Máx. 3 categorías</span>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #FFFBEB 100%)',
                    border: '1px solid #FDE68A',
                    borderRadius: 'var(--radius-xl)',
                    padding: '20px',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                      {featuredFiltered.map(t => renderCard(t))}
                    </div>
                  </div>
                </div>
              )}

              {/* Regular */}
              {regularFiltered.length > 0 && (
                <>
                  {featuredFiltered.length > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
                      Todas las categorías
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {regularFiltered.map(t => renderCard(t))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
