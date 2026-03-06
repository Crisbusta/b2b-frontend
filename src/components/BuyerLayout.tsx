import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

const COMPANY_NAMES: Record<string, string> = {
  'buyer-1': 'Constructora Norte',
  'buyer-2': 'Minera Atacama',
  'sup-1': 'Proveedora Aceros del Pacífico',
  'sup-2': 'Tuberías del Sur S.A.',
  'sup-3': 'Electro Industrial SpA',
  'sup-4': 'HormigonSur Ltda.',
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Industrial Command Center',
  '/catalog':    'Vitrina de Proveedores',
  '/rfqs':       'RFQs & Cotizaciones',
  '/rfqs/new':   'Nueva RFQ',
  '/orders':     'Órdenes & Logística',
  '/suppliers':  'Directorio de Proveedores',
}

const NAV_SECTIONS = [
  {
    label: 'PRINCIPAL',
    items: [
      { to: '/dashboard', label: 'Command Center',       icon: 'dashboard' },
      { to: '/rfqs',      label: 'Workspaces',           icon: 'analytics' },
      { to: '/rfqs',      label: 'RFQs & Cotizaciones',  icon: 'request_quote' },
      { to: '/orders',    label: 'Órdenes & Logística',  icon: 'inventory_2' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/catalog',   label: 'Vitrina de Mercado',        icon: 'storefront' },
      { to: '/catalog',   label: 'Directorio de Proveedores', icon: 'group' },
    ],
  },
]

export default function BuyerLayout({
  children,
  topbarActions,
}: {
  children: ReactNode
  topbarActions?: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const tenantId = localStorage.getItem('tenantCompanyId') ?? ''
  const companyName = COMPANY_NAMES[tenantId] ?? tenantId
  const initials = companyName.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()

  function logout() {
    localStorage.removeItem('tenantCompanyId')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  function isActive(to: string) {
    if (to === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(to)
  }

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname === path)?.[1] ??
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ??
    'Dashboard'

  return (
    <div className="buyer-layout">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="buyer-sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--primary)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 18 }}>precision_manufacturing</span>
            </div>
            <div>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 14, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                <span>INDUS</span><span style={{ fontWeight: 400 }}>MARKET</span>
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
                Centro Comprador
              </div>
            </div>
          </Link>
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="buyer-nav-section">{section.label}</div>
              {section.items.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`buyer-nav-item${isActive(to) ? ' active' : ''}`}
                >
                  <span className="mat-icon" style={{ fontSize: 18 }}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary-light)',
              border: '1.5px solid var(--primary-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{companyName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 1 }}>Comprador Premium</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <span className="mat-icon" style={{ fontSize: 15 }}>logout</span>
            Salir
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="buyer-content">
        {/* Topbar */}
        <div className="buyer-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{pageTitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {topbarActions ?? (
              <>
                {/* Notification bell */}
                <div style={{ position: 'relative' }}>
                  <button style={{
                    width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--surface)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="mat-icon" style={{ fontSize: 18, color: 'var(--text-muted)' }}>notifications</span>
                  </button>
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#EF4444', border: '1.5px solid #fff',
                  }} />
                </div>
                <button className="btn btn-sm" onClick={() => navigate('/rfqs/new')}
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>
                  <span className="mat-icon" style={{ fontSize: 16 }}>add</span>
                  Nueva RFQ
                </button>
                <button className="btn btn-sm btn-accent" onClick={() => navigate('/catalog')}>
                  Ver vitrina
                </button>
              </>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="buyer-main">
          {children}
        </main>
      </div>
    </div>
  )
}
