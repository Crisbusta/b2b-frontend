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
    { to: '/dashboard', label: 'Dashboard',   icon: 'grid_view' },
    { to: '/catalog',   label: 'Vitrina',      icon: 'storefront' },
    { to: '/rfqs',      label: isBuyer ? 'Mis RFQs' : 'Solicitudes de Cotización', icon: 'request_quote' },
    ...(isBuyer ? [
      { to: '/rfqs/new', label: 'Nueva RFQ', icon: 'add_circle' },
      { to: '/orders',   label: 'Pedidos',    icon: 'inventory_2' },
    ] : [
      { to: '/seller', label: 'Centro Vendedor', icon: 'storefront' },
    ]),
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top Bar ──────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 'var(--nav-height)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '28px' }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 20 }}>precision_manufacturing</span>
            </div>
            <div>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                <span>INDUS</span><span style={{ fontWeight: 400 }}>MARKET</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Industrial & Construcción</div>
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
                <span className="mat-icon" style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div className="nav-avatar">{initials}</div>
            <div>
              <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{companyName}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>
                <span className={`badge badge-${role === 'supplier_user' ? 'supplier' : 'buyer'}`}
                  style={{ fontSize: 9, padding: '1px 6px' }}>
                  {ROLE_LABELS[role] ?? role}
                </span>
              </div>
            </div>
            <button className="nav-logout-btn" onClick={logout}>
              <span className="mat-icon" style={{ fontSize: 16 }}>logout</span>
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
