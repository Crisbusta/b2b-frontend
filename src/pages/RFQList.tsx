import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listRFQs, listQuotesByRFQ } from '../api/client'
import type { RFQ, RFQStatus } from '../types/dto'

interface QuoteStats {
  count: number
  supplierIds: string[]
  minBid?: number
  maxBid?: number
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Publicada', closed: 'Cerrada', awarded: 'Adjudicada',
}

const TABS: { key: string; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'draft',     label: 'Borrador' },
  { key: 'published', label: 'Publicadas' },
  { key: 'closed',    label: 'Cerradas' },
]

/* ── Status icon ────────────────────────────────────── */
function StatusIcon({ status }: { status: string }) {
  const icons: Record<string, string> = {
    published: 'check_circle',
    draft:     'edit_note',
    closed:    'lock',
    awarded:   'emoji_events',
  }
  const icon = icons[status]
  if (!icon) return null
  return <span className="mat-icon" style={{ fontSize: 13 }}>{icon}</span>
}

/* ── Quote progress bar ──────────────────────────────── */
function QuoteProgress({ received, invited }: { received: number; invited: number }) {
  if (invited === 0) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin invitados</span>
  const pct = Math.round((received / invited) * 100)
  const color = pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--info)' : 'var(--border-dark)'
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: pct > 0 ? color : 'var(--text-muted)', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {received}/{invited} cotizaron
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

export default function RFQList() {
  const navigate  = useNavigate()
  const role      = localStorage.getItem('userRole') ?? ''
  const isBuyer   = role === 'buyer_user' || role === 'company_admin'

  const [rfqs,      setRfqs]      = useState<RFQ[]>([])
  const [quotesMap, setQuotesMap] = useState<Record<string, QuoteStats>>({})
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [tab,       setTab]       = useState('all')
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    listRFQs()
      .then(async data => {
        setRfqs(data)
        const published = data.filter(r => r.status === 'published')
        const results = await Promise.all(
          published.map(r => listQuotesByRFQ(r.id).catch(() => []))
        )
        const map: Record<string, QuoteStats> = {}
        published.forEach((rfq, i) => {
          const quotes = results[i]
          const totals = quotes.map(q =>
            q.items.reduce((sum, qi) => {
              const rfqItem = rfq.items.find(ri => ri.id === qi.rfqItemId)
              return sum + qi.unitPrice * (rfqItem?.quantity ?? 1)
            }, 0)
          )
          map[rfq.id] = {
            count: quotes.length,
            supplierIds: quotes.map(q => q.supplierCompanyId),
            minBid: totals.length ? Math.min(...totals) : undefined,
            maxBid: totals.length ? Math.max(...totals) : undefined,
          }
        })
        setQuotesMap(map)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rfqs.filter(r => {
    const matchTab    = tab === 'all' || r.status === tab
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.categoryKey.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? rfqs.length : rfqs.filter(r => r.status === t.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isBuyer ? 'Mis RFQs' : 'Solicitudes de Cotización'}</h1>
          <p className="page-subtitle">
            {isBuyer ? 'Gestiona tus solicitudes de cotización' : 'Solicitudes de cotización donde fuiste invitado'}
          </p>
        </div>
        {isBuyer && (
          <button className="btn btn-accent" onClick={() => navigate('/rfqs/new')}>
            <span className="mat-icon" style={{ fontSize: 18 }}>add</span> Nueva RFQ
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><span className="mat-icon" style={{ fontSize: 16 }}>warning</span></span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Search + tabs ─────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: '1 1 260px' }}>
          <span className="icon-prefix"><span className="mat-icon" style={{ fontSize: 16 }}>search</span></span>
          <input
            className="form-input"
            placeholder="Buscar por título o categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`filter-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 18, height: 18, padding: '0 5px',
                  background: tab === t.key ? 'var(--primary)' : 'var(--border)',
                  color: tab === t.key ? '#fff' : 'var(--text-muted)',
                  borderRadius: 20, fontSize: 11, fontWeight: 700, marginLeft: 4,
                }}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="mat-icon mat-icon-lg">request_quote</span>
            </div>
            <div className="empty-state-title">
              {rfqs.length === 0 ? 'Sin RFQs todavía' : 'Sin resultados para este filtro'}
            </div>
            <div className="empty-state-desc">
              {isBuyer && rfqs.length === 0
                ? 'Crea tu primera solicitud de cotización.'
                : !isBuyer && rfqs.length === 0
                ? 'Aún no tienes solicitudes de cotización activas.'
                : 'Prueba con otro filtro o término de búsqueda.'}
            </div>
            {isBuyer && rfqs.length === 0 && (
              <Link to="/rfqs/new" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                Crear RFQ
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>RFQ</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Ítems</th>
                <th>Cotizaciones</th>
                <th>Mayor / Menor Oferta</th>
                <th>Creada</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rfq => {
                const stats = quotesMap[rfq.id]
                return (
                  <tr key={rfq.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rfqs/${rfq.id}`)}>
                    <td>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{rfq.title}</div>
                      <div className="text-small text-muted">{rfq.id}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20,
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {rfq.categoryKey.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${rfq.status as RFQStatus}`}>
                        <StatusIcon status={rfq.status} />
                        {STATUS_LABELS[rfq.status]}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{rfq.items?.length ?? 0}</td>
                    <td>
                      {rfq.status === 'published' ? (
                        <QuoteProgress
                          received={stats?.count ?? 0}
                          invited={rfq.invitedSupplierCompanyIds?.length ?? 0}
                        />
                      ) : rfq.status === 'closed' || rfq.status === 'awarded' ? (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {stats !== undefined ? `${stats.count} recibidas` : `${rfq.invitedSupplierCompanyIds?.length ?? 0} inv.`}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {rfq.invitedSupplierCompanyIds?.length ?? 0} inv.
                        </span>
                      )}
                    </td>
                    <td>
                      {stats?.minBid != null ? (
                        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                          <div style={{ color: 'var(--danger)', fontWeight: 600 }}>H: {formatCLP(stats.maxBid!)}</div>
                          <div style={{ color: 'var(--success)', fontWeight: 700 }}>L: {formatCLP(stats.minBid)}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>
                    <td className="text-small text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(rfq.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {(rfq.status === 'published') ? (
                        <button
                          className={`btn btn-sm ${(stats?.count ?? 0) > 0 ? 'btn-primary' : 'btn-ghost'}`}
                          disabled={(stats?.count ?? 0) === 0}
                          onClick={() => navigate(`/rfqs/${rfq.id}`)}
                          style={{ opacity: (stats?.count ?? 0) === 0 ? 0.45 : 1 }}
                        >
                          <span className="mat-icon" style={{ fontSize: 14 }}>compare_arrows</span>
                          Comparar
                        </button>
                      ) : rfq.status === 'awarded' || rfq.status === 'closed' ? (
                        <Link to={`/rfqs/${rfq.id}`} className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}>
                          <span className="mat-icon" style={{ fontSize: 14 }}>visibility</span>
                          Ver Detalle
                        </Link>
                      ) : (
                        <Link to={`/rfqs/${rfq.id}`} className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}>
                          <span className="mat-icon" style={{ fontSize: 14 }}>edit</span>
                          Editar
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
            Mostrando {filtered.length} de {rfqs.length} {isBuyer ? 'RFQs' : 'solicitudes'}
          </div>
        </div>
      )}

      {/* ── Stat cards al pie ────────────────────────────── */}
      {!loading && isBuyer && (() => {
        const activeCount   = rfqs.filter(r => r.status === 'published').length
        const reviewCount   = Object.values(quotesMap).filter(s => s.count > 0).length
        const awardedCount  = rfqs.filter(r => r.status === 'awarded').length
        const savings       = Object.values(quotesMap).reduce((sum, s) => sum + ((s.maxBid ?? 0) - (s.minBid ?? 0)), 0)
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { label: 'Active RFQs',        value: activeCount,           icon: 'pending_actions', color: 'var(--info)',    bg: 'var(--info-bg)' },
              { label: 'Esperando Revisión',  value: reviewCount,           icon: 'rate_review',     color: 'var(--warning)', bg: 'var(--warning-bg)' },
              { label: 'Adjudicadas',         value: awardedCount,          icon: 'verified',        color: 'var(--success)', bg: 'var(--success-bg)' },
              { label: 'Ahorro Potencial',    value: formatCLP(savings),    icon: 'payments',        color: 'var(--success)', bg: 'var(--success-bg)' },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mat-icon mat-icon-filled" style={{ fontSize: 20, color }}>{icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: typeof value === 'string' ? 14 : 24, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}
