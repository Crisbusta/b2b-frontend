import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listRFQs } from '../api/client'
import type { RFQ, RFQStatus } from '../types/dto'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Publicada', closed: 'Cerrada', awarded: 'Adjudicada',
}

const TABS: { key: string; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'draft',     label: 'Borrador' },
  { key: 'published', label: 'Publicadas' },
  { key: 'closed',    label: 'Cerradas' },
]

/* ── Icons ──────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

const IconArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)

/* ── Status icon ────────────────────────────────────── */
function StatusIcon({ status }: { status: string }) {
  if (status === 'published') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
  if (status === 'draft') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
  if (status === 'closed') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
  if (status === 'awarded') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  )
  return null
}

export default function RFQList() {
  const navigate  = useNavigate()
  const role      = localStorage.getItem('userRole') ?? ''
  const isBuyer   = role === 'buyer_user' || role === 'company_admin'

  const [rfqs,    setRfqs]    = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('all')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    listRFQs()
      .then(setRfqs)
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
          <h1 className="page-title">{isBuyer ? 'Mis RFQs' : 'Invitaciones de cotización'}</h1>
          <p className="page-subtitle">
            {isBuyer ? 'Gestiona tus solicitudes de cotización' : 'RFQs publicadas donde fuiste invitado'}
          </p>
        </div>
        {isBuyer && (
          <button className="btn btn-accent" onClick={() => navigate('/rfqs/new')}>
            <IconPlus /> Nueva RFQ
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><IconWarning /></span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Search + tabs ─────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: '1 1 260px' }}>
          <span className="icon-prefix"><IconSearch /></span>
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
            <div className="empty-state-icon"><IconClipboard /></div>
            <div className="empty-state-title">
              {rfqs.length === 0 ? 'Sin RFQs todavía' : 'Sin resultados para este filtro'}
            </div>
            <div className="empty-state-desc">
              {isBuyer && rfqs.length === 0
                ? 'Crea tu primera solicitud de cotización.'
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
                <th>Proveedores</th>
                <th>Creada</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rfq => (
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
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {rfq.invitedSupplierCompanyIds?.length ?? 0}
                  </td>
                  <td className="text-small text-muted" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(rfq.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <Link to={`/rfqs/${rfq.id}`} className="btn btn-ghost btn-sm">
                      Ver <IconArrowRight />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
            Mostrando {filtered.length} de {rfqs.length} RFQs
          </div>
        </div>
      )}
    </div>
  )
}
