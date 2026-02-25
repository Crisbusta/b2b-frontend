import { Link, useLocation, useNavigate } from 'react-router-dom'

const COMPANY_NAMES: Record<string, string> = {
  'buyer-1': 'Constructora Norte',
  'buyer-2': 'Minera Atacama',
  'sup-1':   'Proveedora Aceros',
  'sup-2':   'Tuberías del Sur',
  'sup-3':   'Electro Industrial',
  'sup-4':   'HormigonSur',
}

const ROLE_LABELS: Record<string, string> = {
  buyer_user:    'Comprador',
  supplier_user: 'Proveedor',
  company_admin: 'Administrador',
}

/* ── SVG Icons ──────────────────────────────────────── */
const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/>
  </svg>
)

const IconClipboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconLogOut = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate    = useNavigate()
  const location    = useLocation()
  const tenantId    = localStorage.getItem('tenantCompanyId') ?? ''
  const role        = localStorage.getItem('userRole') ?? ''
  const isBuyer     = role === 'buyer_user' || role === 'company_admin'
  const companyName = COMPANY_NAMES[tenantId] ?? tenantId
  const initials    = companyName.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()

  function logout() {
    localStorage.removeItem('tenantCompanyId')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { to: '/catalog',   label: 'Vitrina',   icon: <IconGrid /> },
    { to: '/rfqs',      label: isBuyer ? 'Mis RFQs' : 'Invitaciones', icon: <IconClipboard /> },
    ...(isBuyer ? [{ to: '/rfqs/new', label: 'Nueva RFQ', icon: <IconPlus /> }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top Bar ──────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--primary)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        height: 'var(--nav-height)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '28px' }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Marketplace B2B</div>
              <div style={{ color: '#93C5FD', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Industrial & Construcción</div>
            </div>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
            {navItems.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link${isActive(to) ? ' active' : ''}`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div className="nav-avatar">{initials}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{companyName}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>
                <span className={`badge badge-${role === 'supplier_user' ? 'supplier' : 'buyer'}`}
                  style={{ fontSize: 9, padding: '1px 6px' }}>
                  {ROLE_LABELS[role] ?? role}
                </span>
              </div>
            </div>
            <button className="nav-logout-btn" onClick={logout}>
              <IconLogOut />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <main style={{ padding: '28px 0 60px' }}>
        <div className="container">
          {children}
        </div>
      </main>

    </div>
  )
}
