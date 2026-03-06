import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getRFQ, publishRFQ, closeRFQ, listQuotesByRFQ, listCompanies } from '../api/client'
import type { RFQ, Quote, Company } from '../types/dto'
import RFQCompareTable from '../components/RFQCompareTable'
import { useToast } from '../contexts/ToastContext'

const IconAward = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
)

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Publicada', closed: 'Cerrada', awarded: 'Adjudicada',
}

/* ── Icons ──────────────────────────────────────────── */
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

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IconCoin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v2m0 8v2m-4-5h8"/>
    <path d="M9.5 9.5c.3-.9 1.3-1.5 2.5-1.5s2.2.6 2.5 1.5c.3.9-.3 1.8-1.5 2.2-.3.1-.5.3-.5.6v.2"/>
  </svg>
)

const IconBarChart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const IconBox = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

const IconCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function StatusIcon({ status }: { status: string }) {
  if (status === 'published') return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  if (status === 'draft')     return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  if (status === 'closed')    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  return null
}

export default function RFQDetail() {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const { addToast } = useToast()
  const role        = localStorage.getItem('userRole') ?? ''
  const tenantId    = localStorage.getItem('tenantCompanyId') ?? ''
  const isBuyer     = role === 'buyer_user' || role === 'company_admin'
  const isSupplier  = role === 'supplier_user'

  const [rfq,         setRfq]        = useState<RFQ | null>(null)
  const [quotes,      setQuotes]     = useState<Quote[]>([])
  const [suppliers,   setSuppliers]  = useState<Company[]>([])
  const [showCompare, setCompare]    = useState(false)
  const [error,       setError]      = useState('')
  const [actionErr,   setActionErr]  = useState('')

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [r, q, s] = await Promise.all([
        getRFQ(id),
        listQuotesByRFQ(id).catch(() => [] as Quote[]),
        listCompanies('supplier'),
      ])
      setRfq(r); setQuotes(q); setSuppliers(s)
      // Auto-expand compare when ≥2 quotes received
      if (q.length >= 2) setCompare(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function doAction(fn: () => Promise<RFQ>, successMsg: string) {
    setActionErr('')
    try {
      setRfq(await fn())
      addToast(successMsg, 'success')
    } catch (e: unknown) {
      setActionErr(e instanceof Error ? e.message : 'Error')
    }
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

  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]))
  const myQuote     = isSupplier ? quotes.find(q => q.supplierCompanyId === tenantId) : null
  const canQuote    = isSupplier && rfq.status === 'published' && rfq.invitedSupplierCompanyIds.includes(tenantId)
  const totalItems  = rfq.items.length

  const statusOrder: Record<string, number> = { draft: 0, published: 1, closed: 2, awarded: 3 }
  const currentIdx = statusOrder[rfq.status] ?? 0
  const timelineSteps = [
    { key: 'draft',     label: 'Borrador',    sub: 'Creada y en edición' },
    { key: 'published', label: 'Publicada',   sub: 'Invitaciones enviadas' },
    { key: 'closed',    label: 'En revisión', sub: `${quotes.length} cotización${quotes.length !== 1 ? 'es' : ''} recibida${quotes.length !== 1 ? 's' : ''}` },
    { key: 'awarded',   label: 'Adjudicada',  sub: 'Proveedor seleccionado' },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/rfqs">RFQs</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{rfq.title}</span>
      </div>

      {actionErr && <div className="alert alert-error"><span className="alert-icon"><IconWarning /></span><span>{actionErr}</span></div>}

      {/* ── Supplier urgency banner ──────────────────────────── */}
      {isSupplier && rfq.status === 'published' && canQuote && !myQuote && (
        <div style={{
          background: 'var(--attention)',
          border: '1px solid var(--attention-border)',
          borderLeft: '4px solid var(--attention-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#B45309', flexShrink: 0, display: 'flex' }}><IconAlertCircle /></span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>Cotización pendiente</div>
              <div style={{ fontSize: 13, color: '#78350F', marginTop: 2 }}>
                Esta empresa te invitó a cotizar. Responde antes de que la solicitud cierre.
              </div>
            </div>
          </div>
          <button className="btn btn-accent btn-sm" style={{ flexShrink: 0 }}
            onClick={() => navigate(`/rfqs/${rfq.id}/quote`)}>
            <IconCoin /> Cotizar ahora
          </button>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '24px 28px',
        marginBottom: 20, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className={`badge badge-${rfq.status}`}>
                <StatusIcon status={rfq.status} />
                {STATUS_LABELS[rfq.status]}
              </span>
              <span style={{ padding: '3px 10px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {rfq.categoryKey.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 16, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {rfq.title}
            </h1>

            {/* Meta row with dividers */}
            <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'ID', val: rfq.id },
                { label: 'Comprador', val: supplierMap[rfq.buyerCompanyId] ?? rfq.buyerCompanyId },
                { label: 'Creada', val: new Date(rfq.createdAt).toLocaleDateString('es-CL') },
                { label: 'Proveedores', val: rfq.invitedSupplierCompanyIds.map(id => supplierMap[id] ?? id).join(', ') || '—' },
              ].map(({ label, val }, idx) => (
                <div key={label} style={{
                  paddingRight: 24,
                  marginRight: 24,
                  borderRight: idx < 3 ? '1px solid var(--border)' : 'none',
                  marginBottom: 4,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
            {isBuyer && rfq.status === 'draft' && (
              <button className="btn btn-success" onClick={() => doAction(() => publishRFQ(rfq.id), 'RFQ publicada correctamente')}>
                <IconRocket /> Publicar RFQ
              </button>
            )}
            {isBuyer && rfq.status === 'published' && (
              <button className="btn btn-ghost" onClick={() => doAction(() => closeRFQ(rfq.id), 'Recepción de cotizaciones cerrada')}>
                <IconLock /> Cerrar RFQ
              </button>
            )}
            {canQuote && !myQuote && (
              <button className="btn btn-accent" onClick={() => navigate(`/rfqs/${rfq.id}/quote`)}>
                <IconCoin /> Cotizar
              </button>
            )}
            {canQuote && myQuote && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--success-bg)', borderRadius: 8, border: '1px solid var(--success)' }}>
                <span style={{ color: 'var(--success)' }}><IconCheck /></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>Cotización enviada</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* ── Left column ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Items */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><IconBox /> Ítems solicitados</div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{totalItems} ítem{totalItems !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Línea</th>
                    <th>Cant.</th>
                    <th>Unidad</th>
                    <th>Especificación técnica</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{item.lineNumber}</td>
                      <td style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>{item.quantity}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {Object.entries(item.spec).map(([k, v]) => (
                            <span key={k} style={{
                              padding: '2px 8px', borderRadius: 6,
                              background: 'var(--bg)', border: '1px solid var(--border)',
                              fontSize: 12,
                            }}>
                              <span style={{ color: 'var(--text-muted)' }}>{k}:</span>{' '}
                              <span style={{ fontWeight: 600 }}>{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quotes / Compare (buyer only) */}
          {isBuyer && (
            <div className="card">
              <div className="card-header">
                <div className="card-title"><IconList /> Cotizaciones recibidas</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: quotes.length > 0 ? 'var(--success-bg)' : 'var(--bg)',
                    color: quotes.length > 0 ? 'var(--success)' : 'var(--text-muted)',
                  }}>{quotes.length}</span>
                  {quotes.length > 0 && (
                    <>
                      <button
                        className={`btn btn-sm ${showCompare ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCompare(!showCompare)}
                      >
                        {showCompare ? <><IconList /> Ver lista</> : <><IconBarChart /> Comparar</>}
                      </button>
                      {showCompare && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => addToast('Exportar a Excel — próximamente disponible', 'info')}
                        >
                          <IconDownload /> Exportar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {quotes.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 24px' }}>
                  <div className="empty-state-icon"><IconClock /></div>
                  <div className="empty-state-title">Esperando cotizaciones</div>
                  <div className="empty-state-desc">
                    {rfq.status === 'published'
                      ? 'Los proveedores invitados pueden enviar sus cotizaciones.'
                      : 'Publica la RFQ para que los proveedores puedan cotizar.'}
                  </div>
                </div>
              ) : showCompare ? (
                <div style={{ padding: 20 }}>
                  <RFQCompareTable rfq={rfq} quotes={quotes} supplierNames={supplierMap} />
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Estado</th>
                      <th>Ítems</th>
                      <th>Fecha</th>
                      <th>Precio mín. (L1)</th>
                      {rfq.status !== 'awarded' && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(q => {
                      const minPrice = q.items.reduce((min, qi) => Math.min(min, qi.unitPrice), Infinity)
                      return (
                        <tr key={q.id}>
                          <td>
                            <Link to={`/suppliers/${q.supplierCompanyId}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                              {supplierMap[q.supplierCompanyId] ?? q.supplierCompanyId}
                            </Link>
                          </td>
                          <td>
                            <span className="badge badge-submitted">
                              <IconCheck /> {q.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{q.items.length}</td>
                          <td className="text-small text-muted">{new Date(q.createdAt).toLocaleDateString('es-CL')}</td>
                          <td style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                            {isFinite(minPrice)
                              ? (q.items[0]?.currency === 'CLP' ? formatCLP(minPrice) : `${minPrice.toLocaleString('es-CL')} ${q.items[0]?.currency ?? ''}`)
                              : '—'}
                          </td>
                          {rfq.status !== 'awarded' && (
                            <td>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={async () => {
                                  await doAction(() => closeRFQ(rfq.id), 'RFQ cerrada')
                                  localStorage.setItem(`awarded-${rfq.id}`, q.id)
                                  addToast(`Adjudicado a ${supplierMap[q.supplierCompanyId] ?? q.supplierCompanyId}. Ver pedido →`, 'success')
                                  navigate(`/orders/order-${rfq.id}`)
                                }}
                              >
                                <IconAward /> Adjudicar
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Supplier: my quote */}
          {isSupplier && myQuote && (
            <div className="card">
              <div className="card-header">
                <div className="card-title"><IconList /> Mi cotización</div>
                <span className="badge badge-submitted"><IconCheck /> Enviada</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Ítem</th>
                    <th>Precio unitario</th>
                    <th>Moneda</th>
                    <th>Lead time</th>
                  </tr>
                </thead>
                <tbody>
                  {myQuote.items.map(qi => (
                    <tr key={qi.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{qi.rfqItemId}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                        {qi.currency === 'CLP' ? formatCLP(qi.unitPrice) : `${qi.unitPrice.toLocaleString('es-CL')} ${qi.currency}`}
                      </td>
                      <td>{qi.currency}</td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconClock />{qi.leadTimeDays} días</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right column — sidebar ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Timeline */}
          <div className="card">
            <div className="card-header"><div className="card-title">Progreso del RFQ</div></div>
            <div style={{ padding: '16px 20px' }}>
              {timelineSteps.map((step, i) => {
                const state  = i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending'
                const isLast = i === timelineSteps.length - 1
                return (
                  <div key={step.key} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--primary)' : 'var(--border)',
                        color: state === 'pending' ? 'var(--text-muted)' : '#fff',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>
                        {state === 'done' ? <IconCheckSmall /> : i + 1}
                      </div>
                      {!isLast && (
                        <div style={{ width: 2, flex: 1, minHeight: 18, background: i < currentIdx ? 'var(--success)' : 'var(--border)', margin: '3px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: isLast ? 0 : 20 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: state === 'active' ? 700 : 600,
                        color: state === 'active' ? 'var(--primary)' : state === 'done' ? 'var(--success)' : 'var(--text-muted)',
                        marginBottom: 1,
                      }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.sub}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card">
            <div className="card-header"><div className="card-title">Resumen</div></div>
            <div style={{ padding: '0 20px 4px' }}>
              {[
                { label: 'Estado',          val: <span className={`badge badge-${rfq.status}`}><StatusIcon status={rfq.status} />{STATUS_LABELS[rfq.status]}</span> },
                { label: 'Categoría',       val: rfq.categoryKey.replace(/_/g, ' ') },
                { label: 'Ítems',           val: `${totalItems} línea${totalItems !== 1 ? 's' : ''}` },
                { label: 'Cotizaciones',    val: `${quotes.length} recibida${quotes.length !== 1 ? 's' : ''}` },
                { label: 'Proveedores inv.', val: rfq.invitedSupplierCompanyIds.length },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invited suppliers */}
          <div className="card">
            <div className="card-header"><div className="card-title">Proveedores invitados</div></div>
            <div style={{ padding: '0 20px 4px' }}>
              {rfq.invitedSupplierCompanyIds.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>Ninguno invitado</p>
              ) : rfq.invitedSupplierCompanyIds.map(sid => {
                const hasQuoted = quotes.some(q => q.supplierCompanyId === sid)
                return (
                  <div key={sid} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    padding: '12px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div>
                      <Link to={`/suppliers/${sid}`} style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
                        {supplierMap[sid] ?? sid}
                      </Link>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sid}</div>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: hasQuoted ? 'var(--success-bg)' : 'var(--bg)',
                      color: hasQuoted ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      {hasQuoted ? <><IconCheck /> Cotizó</> : <><IconClock /> Pendiente</>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-header"><div className="card-title">Acciones</div></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isBuyer && rfq.status === 'draft' && (
                <button className="btn btn-success" style={{ justifyContent: 'center' }}
                  onClick={() => doAction(() => publishRFQ(rfq.id), 'RFQ publicada correctamente')}>
                  <IconRocket /> Publicar RFQ
                </button>
              )}
              {isBuyer && rfq.status === 'published' && (
                <button className="btn btn-ghost" style={{ justifyContent: 'center' }}
                  onClick={() => doAction(() => closeRFQ(rfq.id), 'Recepción de cotizaciones cerrada')}>
                  <IconLock /> Cerrar recepción
                </button>
              )}
              {canQuote && !myQuote && (
                <button className="btn btn-accent" style={{ justifyContent: 'center' }}
                  onClick={() => navigate(`/rfqs/${rfq.id}/quote`)}>
                  <IconCoin /> Enviar cotización
                </button>
              )}
              {isBuyer && quotes.length > 0 && !showCompare && (
                <button className="btn btn-outline-primary" style={{ justifyContent: 'center' }}
                  onClick={() => setCompare(true)}>
                  <IconBarChart /> Comparar cotizaciones
                </button>
              )}
              <Link to="/rfqs" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                <IconArrowLeft /> Volver al listado
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
