import { Link, useLocation, useNavigate } from 'react-router-dom'

const COMPANY_NAMES: Record<string, string> = {
  'sup-1': 'Proveedora Aceros del Pacífico',
  'sup-2': 'Tuberías del Sur S.A.',
  'sup-3': 'Electro Industrial SpA',
  'sup-4': 'HormigonSur Ltda.',
}

const NAV_ITEMS = [
  { to: '/seller',           label: 'Dashboard',          icon: 'grid_view' },
  { to: '/seller/rfqs',      label: 'Mis Solicitudes',     icon: 'request_quote' },
  { to: '/seller/quotes',    label: 'Responder Cotiz.',    icon: 'edit_note' },
  { to: '/seller/inventory', label: 'Mi Inventario',       icon: 'inventory_2' },
  { to: '/catalog',          label: 'Vitrina',             icon: 'storefront' },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const tenantId  = localStorage.getItem('tenantCompanyId') ?? ''
  const companyName = COMPANY_NAMES[tenantId] ?? tenantId
  const initials  = companyName.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()

  function logout() {
    localStorage.removeItem('tenantCompanyId')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  function isActive(to: string) {
    if (to === '/seller') return location.pathname === '/seller'
    return location.pathname.startsWith(to)
  }

  return (
    <div className="seller-layout">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="seller-sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--accent)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 18 }}>precision_manufacturing</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                <span>INDUS</span><span style={{ fontWeight: 400 }}>MARKET</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
                Centro Vendedor
              </div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`seller-nav-item${isActive(to) ? ' active' : ''}`}
            >
              <span className="mat-icon" style={{ fontSize: 18 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User section at bottom */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{companyName}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 1 }}>Proveedor</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <span className="mat-icon" style={{ fontSize: 15 }}>logout</span>
            Salir
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="seller-content">
        {/* Topbar */}
        <div className="seller-topbar">
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
            <span className="mat-icon" style={{ fontSize: 16, color: 'var(--text-muted)' }}>storefront</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Centro Vendedor</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{companyName}</span>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 10 }}>Proveedor</span>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="seller-main">
          {children}
        </main>
      </div>
    </div>
  )
}
