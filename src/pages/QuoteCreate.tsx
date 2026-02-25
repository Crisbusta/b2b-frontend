import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRFQ, createQuote } from '../api/client'
import type { RFQ, CreateQuoteItemReq } from '../types/dto'

/* ── Icons ──────────────────────────────────────────── */
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

const IconPaperPlane = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const IconSpinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

export default function QuoteCreate() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [rfq,    setRfq]    = useState<RFQ | null>(null)
  const [items,  setItems]  = useState<CreateQuoteItemReq[]>([])
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getRFQ(id)
      .then(r => {
        setRfq(r)
        setItems(r.items.map(item => ({
          rfqItemId:     item.id,
          confirmedSpec: { ...item.spec },
          unitPrice:     0,
          currency:      'CLP',
          leadTimeDays:  7,
        })))
      })
      .catch((e: Error) => setError(e.message))
  }, [id])

  function update(i: number, field: keyof CreateQuoteItemReq, value: unknown) {
    setItems(p => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n })
  }

  async function submit() {
    if (!id) return
    setError('')
    for (let i = 0; i < items.length; i++) {
      if (!items[i].unitPrice || items[i].unitPrice <= 0) {
        setError(`Línea ${i + 1}: el precio unitario es obligatorio y debe ser mayor a 0`); return
      }
      if (!items[i].currency.trim()) {
        setError(`Línea ${i + 1}: la moneda es obligatoria`); return
      }
    }
    setSaving(true)
    try {
      await createQuote(id, { items })
      navigate(`/rfqs/${id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar cotización')
    } finally { setSaving(false) }
  }

  if (!rfq && !error) return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Cargando RFQ...
      </div>
    </div>
  )
  if (error && !rfq)  return <div className="alert alert-error"><span className="alert-icon"><IconWarning /></span><span>{error}</span></div>
  if (!rfq) return null

  const totalValue = items.reduce((sum, i) => {
    const rfqItem = rfq.items.find(x => x.id === i.rfqItemId)
    return sum + (rfqItem?.quantity ?? 0) * i.unitPrice
  }, 0)

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/rfqs">RFQs</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/rfqs/${id}`}>{rfq.title}</Link>
        <span className="breadcrumb-sep">/</span>
        <span>Cotizar</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Enviar cotización</h1>
          <p className="page-subtitle">{rfq.title}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><IconWarning /></span>
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ── Items form ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="alert alert-info">
            <span className="alert-icon"><IconInfo /></span>
            <span>
              Completa el precio y lead time para cada línea. Puedes modificar la spec confirmada si ofreces
              un producto técnicamente equivalente.
            </span>
          </div>

          {rfq.items.map((rfqItem, idx) => (
            <div key={rfqItem.id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="card-title">Línea {rfqItem.lineNumber}</div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                    — {rfqItem.quantity} {rfqItem.unit}
                  </span>
                </div>
              </div>
              <div className="card-body">

                {/* Required spec (read-only) */}
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Especificación requerida
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(rfqItem.spec).map(([k, v]) => (
                      <span key={k} style={{
                        padding: '3px 10px', borderRadius: 6,
                        background: '#fff', border: '1px solid var(--border)',
                        fontSize: 12,
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}:</span>{' '}
                        <span style={{ fontWeight: 600 }}>{String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price + lead time */}
                <div className="grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Precio unitario <span className="required">*</span>
                    </label>
                    <input
                      className="form-input"
                      type="number" min="0" step="0.01"
                      value={items[idx]?.unitPrice ?? 0}
                      onChange={e => update(idx, 'unitPrice', parseFloat(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Moneda <span className="required">*</span></label>
                    <select className="form-select"
                      value={items[idx]?.currency ?? 'CLP'}
                      onChange={e => update(idx, 'currency', e.target.value)}>
                      {['CLP', 'USD', 'EUR', 'UF'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Lead time (días)</label>
                    <input
                      className="form-input"
                      type="number" min="0"
                      value={items[idx]?.leadTimeDays ?? 7}
                      onChange={e => update(idx, 'leadTimeDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Subtotal preview */}
                {items[idx]?.unitPrice > 0 && (
                  <div style={{
                    marginTop: 14, padding: '10px 14px',
                    background: 'var(--success-bg)', borderRadius: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid var(--success)',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 500 }}>
                      Subtotal ({rfqItem.quantity} {rfqItem.unit} × {items[idx].unitPrice.toLocaleString('es-CL')})
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: 15, fontFeatureSettings: '"tnum"' }}>
                      {(rfqItem.quantity * items[idx].unitPrice).toLocaleString('es-CL')} {items[idx].currency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Sidebar summary ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Resumen</div></div>
            <div style={{ padding: '0 20px 4px' }}>
              {rfq.items.map((rfqItem, idx) => {
                const qi  = items[idx]
                const sub = rfqItem.quantity * (qi?.unitPrice ?? 0)
                return (
                  <div key={rfqItem.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      L{rfqItem.lineNumber} ({rfqItem.quantity} {rfqItem.unit})
                    </span>
                    <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>
                      {qi?.unitPrice > 0 ? `${sub.toLocaleString('es-CL')} ${qi.currency}` : '—'}
                    </span>
                  </div>
                )
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 10px', fontWeight: 800, fontSize: 16 }}>
                <span>Total estimado</span>
                <span style={{ color: 'var(--success)', fontFeatureSettings: '"tnum"' }}>
                  {totalValue > 0 ? `${totalValue.toLocaleString('es-CL')} ${items[0]?.currency ?? ''}` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-accent btn-lg"
              style={{ justifyContent: 'center' }}
              onClick={submit}
              disabled={saving}
            >
              {saving ? <><IconSpinner /> Enviando...</> : <><IconPaperPlane /> Enviar cotización</>}
            </button>
            <Link to={`/rfqs/${id}`} className="btn btn-ghost" style={{ justifyContent: 'center' }}>
              Cancelar
            </Link>
          </div>

          <div className="alert alert-warning" style={{ marginBottom: 0 }}>
            <span className="alert-icon"><IconWarning /></span>
            <span><strong>Importante:</strong> Una vez enviada, la cotización no puede modificarse en esta versión.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
