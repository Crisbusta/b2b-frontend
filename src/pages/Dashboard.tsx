import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listRFQs, listTemplates } from '../api/client'
import type { RFQ, Template } from '../types/dto'
import { CATEGORY_META } from './CatalogPage'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Publicada', closed: 'Cerrada', awarded: 'Adjudicada',
}
const STATUS_CLASS: Record<string, string> = {
  draft: 'draft', published: 'published', closed: 'closed', awarded: 'awarded',
}

const COMPANY_NAMES: Record<string, string> = {
  'buyer-1': 'Constructora Norte', 'buyer-2': 'Minera Atacama',
  'sup-1': 'Proveedora Aceros', 'sup-2': 'Tuberías del Sur',
  'sup-3': 'Electro Industrial', 'sup-4': 'HormigonSur',
}
const ROLE_LABELS: Record<string, string> = {
  buyer_user: 'Comprador', supplier_user: 'Proveedor', company_admin: 'Administrador',
}

/* ── Icons ──────────────────────────────────────────── */
const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconLayers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22 6 12 13 2 6"/>
  </svg>
)

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconStore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export default function Dashboard() {
  const navigate    = useNavigate()
  const tenantId    = localStorage.getItem('tenantCompanyId') ?? ''
  const role        = localStorage.getItem('userRole') ?? ''
  const isBuyer     = role === 'buyer_user' || role === 'company_admin'

  const [rfqs,      setRfqs]      = useState<RFQ[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([listRFQs(), listTemplates()])
      .then(([r, t]) => { setRfqs(r); setTemplates(t) })
      .finally(() => setLoading(false))
  }, [])

  const published   = rfqs.filter(r => r.status === 'published').length
  const draft       = rfqs.filter(r => r.status === 'draft').length
  const totalQuotes = rfqs.reduce((sum, r) => sum + (r.items?.length ?? 0), 0)
  const recentRfqs  = [...rfqs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const stats = isBuyer
    ? [
        { icon: <IconClipboard />, label: 'RFQs totales',     value: rfqs.length,       iconBg: 'var(--primary-light)',  iconColor: 'var(--primary)' },
        { icon: <IconCheck />,     label: 'Publicadas',         value: published,          iconBg: '#D1FAE5',               iconColor: 'var(--success)' },
        { icon: <IconEdit />,      label: 'Borradores',         value: draft,              iconBg: '#FEF3C7',               iconColor: 'var(--warning)' },
        { icon: <IconLayers />,    label: 'Categorías activas', value: templates.length,   iconBg: '#EDE9FE',               iconColor: 'var(--purple)' },
      ]
    : [
        { icon: <IconMail />,      label: 'Invitaciones activas', value: rfqs.length,       iconBg: '#D1FAE5',             iconColor: 'var(--success)' },
        { icon: <IconClipboard />, label: 'Ítems a cotizar',       value: totalQuotes,       iconBg: 'var(--primary-light)', iconColor: 'var(--primary)' },
        { icon: <IconLayers />,    label: 'Categorías',            value: templates.length,  iconBg: '#EDE9FE',             iconColor: 'var(--purple)' },
        { icon: <IconBell />,      label: 'Pendientes',            value: rfqs.filter(r => r.status === 'published').length, iconBg: '#FEF3C7', iconColor: 'var(--warning)' },
      ]

  return (
    <div>

      {/* ── Welcome banner ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #112649 0%, var(--primary) 55%, #2B5BA8 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        boxShadow: '0 4px 20px rgba(27,58,107,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot-grid decorative background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ color: '#93C5FD', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {ROLE_LABELS[role] ?? role}
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {COMPANY_NAMES[tenantId] ?? tenantId}
          </h1>
          <p style={{ color: '#93C5FD', fontSize: 14, maxWidth: 440, lineHeight: 1.6 }}>
            {isBuyer
              ? 'Gestiona tus solicitudes de cotización y compara ofertas de proveedores en tiempo real.'
              : 'Revisa las solicitudes donde fuiste invitado y envía tus mejores propuestas.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', position: 'relative' }}>
          {isBuyer && (
            <button className="btn btn-accent btn-lg" onClick={() => navigate('/rfqs/new')}>
              <IconPlus /> Nueva RFQ
            </button>
          )}
          <button className="btn btn-lg"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
            onClick={() => navigate('/catalog')}>
            Ver vitrina
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      {loading ? (
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius)', marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '60%', height: 28, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '80%', height: 14 }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="stat-grid">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                  {s.icon}
                </div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Catalog preview ────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div className="flex-between mb-16">
              <h2 className="section-heading" style={{ marginBottom: 0 }}>
                <span className="section-heading-icon"><IconStore /></span>
                Vitrina de proveedores
              </h2>
              <Link to="/catalog" className="btn btn-ghost btn-sm">Ver todas →</Link>
            </div>
            <div className="catalog-grid">
              {templates.slice(0, 4).map(t => {
                const meta = CATEGORY_META[t.categoryKey] ?? { icon: null, color: '#E2E8F0', desc: '' }
                return (
                  <Link
                    key={t.categoryKey}
                    to={isBuyer ? `/rfqs/new?category=${t.categoryKey}` : '/catalog'}
                    className="catalog-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="catalog-card-icon" style={{ background: meta.color }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div className="catalog-card-name">{t.name}</div>
                      <div className="catalog-card-attrs mt-4">
                        {t.attributes.length} especificaciones · {t.attributes.filter(a => a.required).length} obligatorias
                      </div>
                    </div>
                    <div className="catalog-card-footer">
                      <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                        {isBuyer ? 'Crear RFQ →' : 'Ver categoría →'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Recent RFQs ─────────────────────────────────── */}
          <div>
            <div className="flex-between mb-16">
              <h2 className="section-heading" style={{ marginBottom: 0 }}>
                <span className="section-heading-icon"><IconList /></span>
                {isBuyer ? 'Mis RFQs recientes' : 'Solicitudes recientes'}
              </h2>
              <Link to="/rfqs" className="btn btn-ghost btn-sm">Ver todas →</Link>
            </div>

            {recentRfqs.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon"><IconClipboard /></div>
                  <div className="empty-state-title">Sin RFQs todavía</div>
                  <div className="empty-state-desc">
                    {isBuyer ? 'Crea tu primera solicitud de cotización desde el catálogo.' : 'Aún no tienes invitaciones activas.'}
                  </div>
                  {isBuyer && (
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
                      <th>Título</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                      <th>Ítems</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRfqs.map(rfq => (
                      <tr key={rfq.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{rfq.title}</div>
                          <div className="text-small text-muted">{rfq.buyerCompanyId}</div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{rfq.categoryKey.replace(/_/g, ' ')}</td>
                        <td>
                          <span className={`badge badge-${STATUS_CLASS[rfq.status]}`}>
                            {STATUS_LABELS[rfq.status]}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{rfq.items?.length ?? 0}</td>
                        <td className="text-small text-muted" style={{ whiteSpace: 'nowrap' }}>
                          {new Date(rfq.createdAt).toLocaleDateString('es-CL')}
                        </td>
                        <td>
                          <Link to={`/rfqs/${rfq.id}`} className="btn btn-ghost btn-sm">Ver →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
