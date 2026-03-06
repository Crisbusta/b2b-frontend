import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CATEGORY_META } from './CatalogPage'

const STATS = [
  { value: '250+', label: 'Proveedores certificados' },
  { value: '1.200+', label: 'RFQs procesadas' },
  { value: '3 días', label: 'Tiempo promedio respuesta' },
  { value: '98%', label: 'Satisfacción compradores' },
]

const HOW_STEPS = [
  {
    icon: 'search',
    title: 'Busca tu categoría',
    desc: 'Explora nuestra vitrina de proveedores certificados por categoría técnica.',
  },
  {
    icon: 'request_quote',
    title: 'Crea una RFQ',
    desc: 'Define tus especificaciones técnicas e invita proveedores a cotizar.',
  },
  {
    icon: 'handshake',
    title: 'Adjudica y gestiona',
    desc: 'Compara cotizaciones, adjudica y haz seguimiento de tu pedido en tiempo real.',
  },
]

const CATEGORY_KEYS = Object.keys(CATEGORY_META)

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const hasSession = localStorage.getItem('tenantCompanyId') && localStorage.getItem('userRole')
    if (hasSession) navigate('/dashboard', { replace: true })
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7f8' }}>
      {/* ── Top nav ───────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        height: 64,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#f97316', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 20 }}>precision_manufacturing</span>
            </div>
            <div>
              <div style={{ color: '#1f3b61', fontWeight: 800, fontSize: 15, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                <span>INDUS</span><span style={{ fontWeight: 400 }}>MARKET</span>
              </div>
              <div style={{ color: '#94A3B8', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Industrial & Construcción</div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <Link to="/catalog" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            <span className="mat-icon" style={{ fontSize: 16 }}>storefront</span>
            Explorar Catálogo
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <span className="mat-icon" style={{ fontSize: 16 }}>login</span>
            Ingresar
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0A1830 0%, #1f3b61 60%, #2d5a9a 100%)',
        padding: '80px 0 72px',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)',
            color: '#f97316', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 24,
          }}>
            <span className="mat-icon mat-icon-filled" style={{ fontSize: 14 }}>verified</span>
            Plataforma B2B Industrial
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
            Precisión en abastecimiento{' '}
            <span style={{ color: '#f97316' }}>industrial</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 40px' }}>
            Conecta con proveedores certificados, gestiona RFQs y adjudica con total transparencia. El marketplace especializado para la industria minera y construcción.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link to="/login" className="btn btn-accent btn-lg" style={{ textDecoration: 'none' }}>
              <span className="mat-icon" style={{ fontSize: 20 }}>rocket_launch</span>
              Comenzar gratis
            </Link>
            <Link to="/catalog" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>
              <span className="mat-icon" style={{ fontSize: 20 }}>storefront</span>
              Ver catálogo
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, overflow: 'hidden', maxWidth: 760, margin: '0 auto',
          }}>
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316', lineHeight: 1, marginBottom: 6 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category grid ─────────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1f3b61', letterSpacing: '-0.02em', marginBottom: 10 }}>
              Categorías industriales
            </h2>
            <p style={{ color: '#64748B', fontSize: 16 }}>
              Especificaciones técnicas estandarizadas para comparación exacta de cotizaciones
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {CATEGORY_KEYS.map(key => {
              const meta = CATEGORY_META[key]
              return (
                <Link
                  key={key}
                  to="/login"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: '#fff', border: '1.5px solid #E2E8F0',
                    borderRadius: 16, padding: '20px', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <div style={{ width: 48, height: 48, background: meta.color, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B', marginBottom: 4 }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{meta.desc}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                        {meta.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#f6f7f8', color: '#64748B', border: '1px solid #E2E8F0' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section style={{ padding: '64px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1f3b61', letterSpacing: '-0.02em', marginBottom: 10 }}>
              ¿Cómo funciona?
            </h2>
            <p style={{ color: '#64748B', fontSize: 16 }}>Tres pasos para abastecerte con precisión</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {HOW_STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{
                  width: 64, height: 64,
                  background: i === 1 ? '#f97316' : '#1f3b61',
                  borderRadius: 18, margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: i === 1 ? '0 8px 24px rgba(249,115,22,0.35)' : '0 8px 24px rgba(31,59,97,0.25)',
                }}>
                  <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 28 }}>{step.icon}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: i === 1 ? '#f97316' : '#1f3b61', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Paso {i + 1}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────── */}
      <section style={{ padding: '64px 0', background: 'linear-gradient(135deg, #1f3b61, #2d5a9a)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            ¿Listo para optimizar tu abastecimiento?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 32 }}>
            Únete a más de 250 empresas que ya gestionan sus compras industriales con INDUSMARKET
          </p>
          <Link to="/login" className="btn btn-accent btn-lg" style={{ textDecoration: 'none' }}>
            <span className="mat-icon" style={{ fontSize: 20 }}>arrow_forward</span>
            Comenzar ahora
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: '#0A1830', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#f97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 15 }}>precision_manufacturing</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>INDUSMARKET B2B</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Términos', 'Privacidad', 'Contacto'].map(l => (
              <span key={l} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>© 2026 IndusMarket</span>
        </div>
      </footer>
    </div>
  )
}
