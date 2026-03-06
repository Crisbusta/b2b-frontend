import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRFQs, listQuotesByRFQ } from '../api/client'
import type { RFQ, Quote } from '../types/dto'

const COMPANY_NAMES: Record<string, string> = {
  'buyer-1': 'Constructora Norte', 'buyer-2': 'Minera Atacama',
  'sup-1': 'Proveedora Aceros', 'sup-2': 'Tuberías del Sur',
  'sup-3': 'Electro Industrial', 'sup-4': 'HormigonSur',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Activa', closed: 'Cerrada', awarded: 'Adjudicada',
}

const PRICE_TRENDS = [
  { name: 'Acero Estructural (ASTM A36)', unit: 'USD/Tonelada', price: '$890.00', change: -2.4 },
  { name: 'Cable de Cobre (Media Tensión)', unit: 'USD/Metro', price: '$12.45', change: +0.8 },
  { name: 'Resina PVC (Grado Tubería)', unit: 'USD/kg', price: '$1.12', change: 0.0 },
]

const RECENT_HISTORY = [
  { color: 'var(--primary)', icon: 'swap_horiz', text: 'RFQ "Tuberías PEAD" publicada', time: 'Hace 2 días' },
  { color: 'var(--success)', icon: 'request_quote', text: 'Nueva cotización recibida de Proveedora Aceros', time: 'Hace 3 días' },
  { color: '#7C3AED', icon: 'local_shipping', text: 'Orden #ORD-001 en tránsito', time: 'Hace 5 días' },
]

function workspaceStrip(status: string) {
  if (status === 'published') return 'var(--info)'
  if (status === 'draft') return '#F59E0B'
  return 'var(--border-dark)'
}

export default function Dashboard() {
  const tenantId = localStorage.getItem('tenantCompanyId') ?? ''
  const companyName = COMPANY_NAMES[tenantId] ?? tenantId

  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [quotesMap, setQuotesMap] = useState<Record<string, Quote[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listRFQs()
      .then(async r => {
        setRfqs(r)
        const published = r.filter(rfq => rfq.status === 'published')
        const results = await Promise.all(
          published.map(rfq => listQuotesByRFQ(rfq.id).catch(() => [] as Quote[]))
        )
        const map: Record<string, Quote[]> = {}
        published.forEach((rfq, i) => { map[rfq.id] = results[i] })
        setQuotesMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  // Alert cards
  const draftRfqs = rfqs.filter(r => r.status === 'draft')
  const publishedWithQuotes = rfqs.filter(r => r.status === 'published' && (quotesMap[r.id]?.length ?? 0) > 0)

  // Workspace cards — published + draft RFQs
  const workspaceRfqs = rfqs.filter(r => r.status === 'published' || r.status === 'draft').slice(0, 6)

  return (
    <div>
      {/* ── Hero banner ──────────────────────────────────── */}
      <div className="buyer-hero">
        <div style={{ maxWidth: 700, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Centro de Operaciones
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 6 }}>
            Bienvenido de nuevo, {companyName}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 24 }}>
            Gestiona tus solicitudes de cotización y proveedores desde un solo lugar.
          </p>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span className="mat-icon" style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                fontSize: 18, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none',
              }}>search</span>
              <input
                className="buyer-hero-search"
                type="text"
                placeholder="Buscar materiales, proveedores o RFQs..."
              />
            </div>
            <button
              className="btn btn-accent btn-sm"
              title="Cargar especificaciones técnicas"
              style={{ flexShrink: 0, height: 44, paddingInline: 14 }}
            >
              <span className="mat-icon" style={{ fontSize: 18 }}>upload_file</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px 48px' }}>

        {/* ── Alertas y Acciones Prioritarias ──────────────── */}
        {!loading && (draftRfqs.length > 0 || publishedWithQuotes.length > 0) && (
          <div style={{ marginBottom: 28 }}>
            <h2 className="section-heading" style={{ marginBottom: 14 }}>
              <span className="section-heading-icon">
                <span className="mat-icon" style={{ fontSize: 16 }}>notifications_active</span>
              </span>
              Alertas y Acciones Prioritarias
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {draftRfqs.slice(0, 1).map(rfq => (
                <Link key={rfq.id} to={`/rfqs/${rfq.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#FFFBEB', border: '1px solid #F59E0B',
                    borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                    transition: 'box-shadow 0.15s',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span className="mat-icon mat-icon-filled" style={{ fontSize: 18, color: '#D97706' }}>edit_note</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Borrador pendiente de envío</div>
                      <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
                        "{rfq.title}" — Publica para recibir cotizaciones
                      </div>
                    </div>
                    <span className="mat-icon" style={{ fontSize: 16, color: '#D97706' }}>chevron_right</span>
                  </div>
                </Link>
              ))}
              {publishedWithQuotes.slice(0, 1).map(rfq => (
                <Link key={rfq.id} to={`/rfqs/${rfq.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#F0FDF4', border: '1px solid #6EE7B7',
                    borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span className="mat-icon mat-icon-filled" style={{ fontSize: 18, color: '#059669' }}>request_quote</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>Nueva cotización recibida</div>
                      <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                        "{rfq.title}" — {quotesMap[rfq.id]?.length ?? 0} cotización{(quotesMap[rfq.id]?.length ?? 0) !== 1 ? 'es' : ''} lista{(quotesMap[rfq.id]?.length ?? 0) !== 1 ? 's' : ''} para revisar
                      </div>
                    </div>
                    <span className="mat-icon" style={{ fontSize: 16, color: '#059669' }}>chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Industrial Workspaces ─────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div className="flex-between mb-16">
            <h2 className="section-heading" style={{ marginBottom: 0 }}>
              <span className="section-heading-icon">
                <span className="mat-icon" style={{ fontSize: 16 }}>workspaces</span>
              </span>
              Industrial Workspaces
            </h2>
            <Link to="/rfqs" className="btn btn-ghost btn-sm">Ver todos →</Link>
          </div>

          {loading ? (
            <div className="workspace-grid">
              {[0, 1, 2].map(i => (
                <div key={i} className="skeleton-card" style={{ height: 160 }} />
              ))}
            </div>
          ) : (
            <div className="workspace-grid">
              {workspaceRfqs.map(rfq => {
                const quoteCount = quotesMap[rfq.id]?.length ?? 0
                const stripColor = workspaceStrip(rfq.status)
                return (
                  <div key={rfq.id} className="workspace-card">
                    <div className="workspace-card-strip" style={{ background: stripColor }} />
                    <div className="workspace-card-body">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>
                            {rfq.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rfq.id}</div>
                        </div>
                        <span style={{
                          flexShrink: 0,
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: rfq.status === 'published' ? 'var(--status-published-bg)' : rfq.status === 'draft' ? 'var(--status-draft-bg)' : 'var(--status-closed-bg)',
                          color: rfq.status === 'published' ? 'var(--status-published-text)' : rfq.status === 'draft' ? 'var(--status-draft-text)' : 'var(--status-closed-text)',
                        }}>
                          {STATUS_LABELS[rfq.status] ?? rfq.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{rfq.items?.length ?? 0}</span> Ítems
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 700, color: quoteCount > 0 ? 'var(--success)' : 'var(--text)' }}>{quoteCount}</span> Cotizaciones
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {rfq.invitedSupplierCompanyIds?.slice(0, 3).map((id, i) => {
                            const name = COMPANY_NAMES[id] ?? id
                            const init = name.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase()
                            return <div key={i} className="team-avatar">{init}</div>
                          })}
                        </div>
                        <Link to={`/rfqs/${rfq.id}`} style={{
                          fontSize: 12, fontWeight: 600, color: 'var(--primary)',
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          Gestionar
                          <span className="mat-icon" style={{ fontSize: 14 }}>arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
              {/* Add new workspace */}
              <Link to="/rfqs/new" className="workspace-card-add">
                <span className="mat-icon" style={{ fontSize: 28 }}>add_circle_outline</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Nuevo Workspace</span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Bottom 2-column ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

          {/* Market Price Trends */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="section-heading-icon">
                <span className="mat-icon" style={{ fontSize: 16 }}>trending_up</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Tendencias de Precios de Mercado</span>
            </div>
            <div>
              {PRICE_TRENDS.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px',
                  borderBottom: i < PRICE_TRENDS.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{item.price}</div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, marginTop: 2,
                      color: item.change > 0 ? 'var(--success)' : item.change < 0 ? 'var(--danger)' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end',
                    }}>
                      {item.change !== 0 && (
                        <span className="mat-icon" style={{ fontSize: 13 }}>
                          {item.change > 0 ? 'trending_up' : 'trending_down'}
                        </span>
                      )}
                      {item.change === 0 ? 'Sin cambio' : `${item.change > 0 ? '+' : ''}${item.change}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial Reciente */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="section-heading-icon">
                <span className="mat-icon" style={{ fontSize: 16 }}>history</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Historial Reciente</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {RECENT_HISTORY.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < RECENT_HISTORY.length - 1 ? 16 : 0, position: 'relative' }}>
                  {i < RECENT_HISTORY.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 14, top: 28,
                      width: 2, height: 'calc(100% + 16px)',
                      background: 'var(--border)',
                    }} />
                  )}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: event.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <span className="mat-icon" style={{ fontSize: 14, color: event.color }}>{event.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{event.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
