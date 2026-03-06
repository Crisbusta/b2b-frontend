import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listTemplates, listCompanies, createRFQ, publishRFQ } from '../api/client'
import type { Template, Company, CreateRFQItemReq } from '../types/dto'
import { CATEGORY_META } from './CatalogPage'

const STEPS = ['Categoría', 'General', 'Proveedores', 'Ítems']

/* ── Icons ──────────────────────────────────────────── */
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconRocket = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
)

const IconFactory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
    <path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
  </svg>
)

const IconBox = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

export default function RFQCreate() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const preselect     = params.get('category') ?? ''

  const [step,        setStep]       = useState(preselect ? 1 : 0)
  const [templates,   setTemplates]  = useState<Template[]>([])
  const [suppliers,   setSuppliers]  = useState<Company[]>([])
  const [categoryKey, setCategory]   = useState(preselect)
  const [template,    setTemplate]   = useState<Template | null>(null)
  const [title,       setTitle]      = useState('')
  const [invited,     setInvited]    = useState<string[]>([])
  const [items,       setItems]      = useState<CreateRFQItemReq[]>([])
  const [showOptional, setShowOptional] = useState<Record<number, boolean>>({})
  const [error,       setError]      = useState('')
  const [saving,      setSaving]     = useState(false)

  useEffect(() => {
    listTemplates().then(ts => {
      setTemplates(ts)
      if (preselect) {
        const t = ts.find(x => x.categoryKey === preselect)
        if (t) setTemplate(t)
      }
    })
    listCompanies('supplier').then(setSuppliers)
  }, [preselect])

  function pickCategory(key: string) {
    setCategory(key)
    const t = templates.find(x => x.categoryKey === key) ?? null
    setTemplate(t)
    setItems([])
    setStep(1)
  }

  function toggleSupplier(id: string) {
    setInvited(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function addItem() {
    if (!template) return
    const spec: Record<string, unknown> = {}
    for (const attr of template.attributes) {
      if (attr.type === 'enum' && attr.enumValues?.length) spec[attr.key] = attr.enumValues[0]
      else if (attr.type === 'number') spec[attr.key] = 0
      else if (attr.type === 'boolean') spec[attr.key] = false
      else spec[attr.key] = ''
    }
    setItems(p => [...p, { lineNumber: p.length + 1, quantity: 1, unit: 'm', spec }])
  }

  function removeItem(i: number) {
    setItems(p => p.filter((_, j) => j !== i).map((x, j) => ({ ...x, lineNumber: j + 1 })))
  }

  function updateItem(i: number, field: string, value: unknown) {
    setItems(p => {
      const next = [...p]
      if      (field === 'quantity') next[i] = { ...next[i], quantity: Number(value) }
      else if (field === 'unit')     next[i] = { ...next[i], unit: String(value) }
      else                           next[i] = { ...next[i], spec: { ...next[i].spec, [field]: value } }
      return next
    })
  }

  async function handleSave(publish: boolean) {
    setError('')
    if (!title.trim())      { setError('El título es obligatorio'); setStep(1); return }
    if (!categoryKey)       { setError('Selecciona una categoría'); setStep(0); return }
    if (items.length === 0) { setError('Agrega al menos un ítem'); setStep(3); return }

    setSaving(true)
    try {
      const rfq = await createRFQ({ title, categoryKey, invitedSupplierCompanyIds: invited, items })
      if (publish) await publishRFQ(rfq.id)
      navigate(`/rfqs/${rfq.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear RFQ')
    } finally {
      setSaving(false)
    }
  }

  const canNext = [!!categoryKey, !!title.trim(), true, items.length > 0]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/rfqs">RFQs</a>
        <span className="breadcrumb-sep">/</span>
        <span>Nueva solicitud de cotización</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Nueva RFQ</h1>
          <p className="page-subtitle">Solicitud de cotización a proveedores invitados</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><IconWarning /></span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Step indicator ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {STEPS.map((label, i) => {
          const done    = i < step
          const current = i === step
          const state   = done ? 'done' : current ? 'current' : 'pending'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <button
                onClick={() => i < step && setStep(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: i < step ? 'pointer' : 'default', padding: 0 }}
              >
                <div className={`step-circle ${state}`}>
                  {done ? <IconCheck /> : i + 1}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: current ? 700 : 500,
                  color: current ? 'var(--text)' : done ? 'var(--text-muted)' : 'var(--text-light)',
                  whiteSpace: 'nowrap',
                }}>{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="step-connector" style={{ background: done ? 'var(--success)' : 'var(--border)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── STEP 0: Categoría ─────────────────────────────── */}
      {step === 0 && (
        <div>
          <div className="section-heading">Selecciona la categoría técnica</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {templates.map(t => {
              const meta = CATEGORY_META[t.categoryKey] ?? { icon: null, color: '#E2E8F0', desc: '', tags: [] }
              const sel  = categoryKey === t.categoryKey
              return (
                <div key={t.categoryKey}
                  onClick={() => pickCategory(t.categoryKey)}
                  style={{
                    background: '#fff', padding: 20,
                    border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    boxShadow: sel ? '0 0 0 3px var(--primary-50)' : 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, background: meta.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.attributes.length} atributos</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{meta.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEP 1: General ──────────────────────────────── */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Datos generales
            </div>
            {template && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '4px 12px', background: CATEGORY_META[categoryKey]?.color ?? 'var(--bg)',
                borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--text)',
              }}>
                {template.name}
              </span>
            )}
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Título del RFQ <span className="required">*</span></label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Tubería PEAD DN110 Proyecto Atacama — Fase 2"
              />
              <div className="form-hint">
                Un título descriptivo ayuda a los proveedores a identificar tu solicitud
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Proveedores ───────────────────────────── */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconFactory /> Proveedores invitados
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {invited.length} seleccionado{invited.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <span className="alert-icon"><IconInfo /></span>
              <span>Solo los proveedores invitados podrán ver y cotizar esta RFQ. Puedes invitar a ninguno o a todos.</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {suppliers.map(sup => (
                <label key={sup.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${invited.includes(sup.id) ? 'var(--success)' : 'var(--border)'}`,
                  background: invited.includes(sup.id) ? 'var(--success-bg)' : '#fff',
                  transition: 'all var(--transition-fast)',
                }}>
                  <input type="checkbox" checked={invited.includes(sup.id)} onChange={() => toggleSupplier(sup.id)}
                    style={{ width: 16, height: 16, accentColor: 'var(--success)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{sup.name}</div>
                    <div className="text-small text-muted">{sup.id}</div>
                  </div>
                  <span className="badge badge-supplier">Proveedor</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Ítems ────────────────────────────────── */}
      {step === 3 && (
        <div>
          <div className="flex-between mb-16">
            <div className="section-heading" style={{ marginBottom: 0 }}>
              <IconBox /> Ítems del RFQ
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={addItem} disabled={!template}>
              + Agregar ítem
            </button>
          </div>

          {items.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><IconBox /></div>
                <div className="empty-state-title">Sin ítems</div>
                <div className="empty-state-desc">Agrega al menos un ítem con su especificación técnica.</div>
                <button className="btn btn-primary btn-sm" onClick={addItem} style={{ marginTop: 16 }}>
                  + Agregar primer ítem
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item, idx) => (
                <div key={idx} className="card">
                  <div className="card-header">
                    <div className="card-title">Línea {item.lineNumber}</div>
                    <button
                      onClick={() => removeItem(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="grid-2" style={{ marginBottom: 16 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Cantidad <span className="required">*</span></label>
                        <input className="form-input" type="number" min="0" value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Unidad <span className="required">*</span></label>
                        <input className="form-input" value={item.unit}
                          onChange={e => updateItem(idx, 'unit', e.target.value)}
                          placeholder="m, kg, un, m², m³..." />
                      </div>
                    </div>

                    {/* Spec fields — required + optional accordion */}
                    {(() => {
                      const requiredAttrs = template?.attributes.filter(a => a.required) ?? []
                      const optionalAttrs = template?.attributes.filter(a => !a.required) ?? []
                      const isOpen = !!showOptional[idx]

                      function renderField(attr: typeof requiredAttrs[0]) {
                        return (
                          <div key={attr.key} className="form-group" style={{ marginBottom: 12 }}>
                            <label className="form-label">
                              {attr.label}
                              {attr.unit && <span className="unit">({attr.unit})</span>}
                              {attr.required && <span className="required"> *</span>}
                            </label>
                            {attr.type === 'enum' ? (
                              <select className="form-select"
                                value={String(item.spec[attr.key] ?? '')}
                                onChange={e => updateItem(idx, attr.key, e.target.value)}>
                                {attr.enumValues?.map(v => <option key={v} value={v}>{v}</option>)}
                              </select>
                            ) : attr.type === 'number' ? (
                              <input className="form-input" type="number"
                                value={Number(item.spec[attr.key] ?? 0)}
                                onChange={e => updateItem(idx, attr.key, parseFloat(e.target.value))} />
                            ) : attr.type === 'boolean' ? (
                              <select className="form-select"
                                value={String(item.spec[attr.key])}
                                onChange={e => updateItem(idx, attr.key, e.target.value === 'true')}>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                              </select>
                            ) : (
                              <input className="form-input"
                                value={String(item.spec[attr.key] ?? '')}
                                onChange={e => updateItem(idx, attr.key, e.target.value)} />
                            )}
                          </div>
                        )
                      }

                      return (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                          {requiredAttrs.length > 0 && (
                            <>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
                                Especificaciones requeridas
                              </div>
                              <div className="grid-2">{requiredAttrs.map(renderField)}</div>
                            </>
                          )}

                          {optionalAttrs.length > 0 && (
                            <div style={{ marginTop: requiredAttrs.length > 0 ? 16 : 0 }}>
                              <button
                                type="button"
                                onClick={() => setShowOptional(p => ({ ...p, [idx]: !p[idx] }))}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: 13, fontWeight: 600, color: 'var(--primary)',
                                  padding: '6px 0', marginBottom: isOpen ? 14 : 0,
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s ease' }}>
                                  <polyline points="9 18 15 12 9 6"/>
                                </svg>
                                Especificaciones adicionales ({optionalAttrs.length})
                              </button>
                              {isOpen && (
                                <div className="grid-2" style={{ padding: '0 0 4px 20px', borderLeft: '2px solid var(--border)' }}>
                                  {optionalAttrs.map(renderField)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation buttons ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate('/rfqs')} disabled={saving}>
          <IconArrowLeft /> {step === 0 ? 'Cancelar' : 'Atrás'}
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext[step]}>
              Siguiente <IconArrowRight />
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar borrador'}
              </button>
              <button className="btn btn-success" onClick={() => handleSave(true)} disabled={saving}>
                <IconRocket /> {saving ? 'Publicando...' : 'Guardar y publicar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
