import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../types/dto'

const ROLES = [
  { value: 'buyer_user',    label: 'Comprador',    desc: 'Crear y gestionar RFQs' },
  { value: 'supplier_user', label: 'Proveedor',    desc: 'Ver invitaciones y cotizar' },
  { value: 'company_admin', label: 'Administrador', desc: 'Acceso completo a la empresa' },
]

const FEATURES = [
  { icon: 'description',  text: 'Solicitudes de cotización estructuradas' },
  { icon: 'settings',     text: 'Especificaciones técnicas por categoría' },
  { icon: 'bar_chart',    text: 'Comparación de cotizaciones en tiempo real' },
  { icon: 'group',        text: 'Multi-empresa y multi-rol' },
]

export default function LoginMock() {
  const navigate = useNavigate()
  const [companies, setCompanies]      = useState<Company[]>([])
  const [selectedCompany, setSelected] = useState('')
  const [selectedRole, setRole]        = useState('buyer_user')
  const [error, setError]              = useState('')
  const [loading, setLoading]          = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (localStorage.getItem('tenantCompanyId') && role) {
      navigate(role === 'supplier_user' ? '/seller' : '/dashboard'); return
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
    navigate(selectedRole === 'supplier_user' ? '/seller' : '/dashboard')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>

      {/* ── Left panel — branding ────────────────────── */}
      <div style={{
        flex: '1 1 50%',
        background: 'linear-gradient(145deg, #0A1830 0%, #112649 45%, #1f3b61 80%, #2B5BA8 100%)',
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
              width: 48, height: 48, background: 'var(--accent)',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="mat-icon mat-icon-filled" style={{ color: '#fff', fontSize: 26 }}>precision_manufacturing</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>
                <span>INDUS</span><span style={{ fontWeight: 400 }}>MARKET</span>
              </div>
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
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#93C5FD', flexShrink: 0,
                }}>
                  <span className="mat-icon" style={{ fontSize: 20 }}>{f.icon}</span>
                </div>
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
                <span className="mat-icon" style={{ fontSize: 16 }}>error</span>
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
                      borderRadius: 10,
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
