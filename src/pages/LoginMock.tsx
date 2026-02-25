import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../types/dto'

const ROLES = [
  { value: 'buyer_user',    label: 'Comprador',       desc: 'Crear y gestionar RFQs' },
  { value: 'supplier_user', label: 'Proveedor',        desc: 'Ver invitaciones y cotizar' },
  { value: 'company_admin', label: 'Administrador',    desc: 'Acceso completo a la empresa' },
]

/* ── Feature icons ──────────────────────────────────── */
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0M12 2v2m0 18v-2M2 12h2m18 0h-2"/>
  </svg>
)

const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const FEATURES = [
  { icon: <IconFileText />, text: 'Solicitudes de cotización estructuradas' },
  { icon: <IconSettings />, text: 'Especificaciones técnicas por categoría' },
  { icon: <IconBarChart />, text: 'Comparación de cotizaciones en tiempo real' },
  { icon: <IconUsers />,    text: 'Multi-empresa y multi-rol' },
]

export default function LoginMock() {
  const navigate = useNavigate()
  const [companies, setCompanies]       = useState<Company[]>([])
  const [selectedCompany, setSelected]  = useState('')
  const [selectedRole, setRole]         = useState('buyer_user')
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (localStorage.getItem('tenantCompanyId') && localStorage.getItem('userRole')) {
      navigate('/dashboard'); return
    }
    fetch('/api/v1/companies', {
      headers: { 'X-Tenant-Company-Id': 'system', 'X-Mock-User-Role': 'company_admin' },
    })
      .then(r => r.json())
      .then((data: Company[]) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
        setCompanies(sorted)
        if (sorted.length > 0) {
          setSelected(sorted[0].id)
          setRole(sorted[0].type === 'supplier' ? 'supplier_user' : 'buyer_user')
        }
      })
      .catch(() => setError('No se pudo conectar con la API. ¿Está corriendo docker compose?'))
      .finally(() => setLoading(false))
  }, [navigate])

  function onCompanyChange(id: string) {
    setSelected(id)
    const c = companies.find(x => x.id === id)
    if (c) setRole(c.type === 'supplier' ? 'supplier_user' : 'buyer_user')
  }

  function handleLogin() {
    if (!selectedCompany) { setError('Selecciona una empresa'); return }
    localStorage.setItem('tenantCompanyId', selectedCompany)
    localStorage.setItem('userRole', selectedRole)
    navigate('/dashboard')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>

      {/* ── Left panel — branding ────────────────────── */}
      <div style={{
        flex: '1 1 50%',
        background: 'linear-gradient(145deg, #0A1830 0%, #112649 45%, #1B3A6B 80%, #2B5BA8 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background dot-grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -80, bottom: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', left: -40, top: '30%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44, height: 44, background: 'var(--accent)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Marketplace B2B</div>
              <div style={{ color: '#93C5FD', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Industrial & Construcción</div>
            </div>
          </div>

          <h1 style={{ color: '#fff', fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
            La plataforma de<br />
            <span style={{ color: '#FDBA74' }}>abastecimiento industrial</span><br />
            más eficiente
          </h1>
          <p style={{ color: '#93C5FD', fontSize: 15, marginBottom: 44, maxWidth: 380, lineHeight: 1.7 }}>
            Conecta compradores industriales con proveedores certificados.
            Gestiona RFQs, compara cotizaciones y adjudica en un solo lugar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#93C5FD', flexShrink: 0,
                }}>{f.icon}</div>
                <span style={{ color: '#CBD5E1', fontSize: 14 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 48, padding: '16px 20px',
            background: 'rgba(255,255,255,0.07)', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div style={{ color: '#F1F5F9', fontSize: 13, fontStyle: 'italic', lineHeight: 1.6 }}>
              "Redujimos nuestros tiempos de cotización de 3 semanas a 3 días con esta plataforma."
            </div>
            <div style={{ color: '#93C5FD', fontSize: 12, marginTop: 8, fontWeight: 600 }}>
              — Gerente de Abastecimiento, Constructora Norte S.A.
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────── */}
      <div style={{
        flex: '1 1 50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 40px',
        background: '#fff',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.01em' }}>
              Acceder al sistema
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Modo demo — selecciona tu empresa y rol
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '20px 0' }}>
              <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Cargando empresas...
            </div>
          ) : (
            <>
              {/* Company selector */}
              <div className="form-group">
                <label className="form-label">Empresa</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {companies.map(c => (
                    <label key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: `2px solid ${selectedCompany === c.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: selectedCompany === c.id ? 'var(--primary-light)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}>
                      <input
                        type="radio" name="company" value={c.id}
                        checked={selectedCompany === c.id}
                        onChange={() => onCompanyChange(c.id)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.id}</div>
                      </div>
                      <span className={`badge badge-${c.type === 'buyer' ? 'buyer' : 'supplier'}`}>
                        {c.type === 'buyer' ? 'Comprador' : 'Proveedor'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Role selector */}
              <div className="form-group">
                <label className="form-label">Rol de acceso</label>
                <select
                  className="form-select"
                  value={selectedRole}
                  onChange={e => setRole(e.target.value)}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} onClick={handleLogin}>
                Ingresar al marketplace →
              </button>

              <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: 12, marginTop: 20 }}>
                Entorno de demostración — datos no persistentes
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
