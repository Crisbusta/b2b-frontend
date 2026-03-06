import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCompany } from '../api/client'
import type { Company } from '../types/dto'
import { SUPPLIER_PROFILES } from '../data/mockData'
import { CATEGORY_META } from './CatalogPage'

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}>
          <span className="mat-icon mat-icon-filled" style={{ fontSize: 16 }}>star</span>
        </span>
      ))}
      <span style={{ marginLeft: 6, fontSize: 14, color: 'var(--text-muted)', fontWeight: 700 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isBuyer = ['buyer_user', 'company_admin'].includes(localStorage.getItem('userRole') ?? '')

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [message, setMessage] = useState('')

  const prof = id ? SUPPLIER_PROFILES[id] : null

  useEffect(() => {
    if (!id) return
    getCompany(id).then(setCompany).catch(() => {
      // fallback: build from profile
      setCompany(null)
    }).finally(() => setLoading(false))
    if (prof?.categories?.[0]) setSelectedCategory(prof.categories[0])
  }, [id, prof])

  if (loading) return (
    <div style={{ padding: '40px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Cargando perfil...
    </div>
  )

  if (!prof && !company) return <div className="alert alert-error">Proveedor no encontrado.</div>

  const displayName = company?.name ?? prof?.id ?? id ?? ''

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/catalog">Vitrina</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{displayName}</span>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1830 0%, #1f3b61 70%, #2d5a9a 100%)',
        borderRadius: 'var(--radius-xl)', padding: '40px 40px 36px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(249,115,22,0.08)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {displayName}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20,
                background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.4)',
                color: '#34D399', fontSize: 11, fontWeight: 700,
              }}>
                <span className="mat-icon mat-icon-filled" style={{ fontSize: 12 }}>verified</span>
                Verificado
              </span>
            </div>
            {prof && (
              <>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 10 }}>{prof.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  <span className="mat-icon" style={{ fontSize: 15 }}>location_on</span>
                  {prof.location}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {prof && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Pedidos completados', value: prof.completedOrders, icon: 'check_circle', color: 'var(--success)' },
            { label: 'Calificación promedio', value: prof.rating.toFixed(1), icon: 'star', color: '#F59E0B' },
            { label: 'Respuesta promedio', value: `${prof.avgResponseDays}d`, icon: 'schedule', color: 'var(--info)' },
            { label: 'Años de experiencia', value: prof.yearsInBusiness, icon: 'business', color: 'var(--primary)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ color }}>
                <span className="mat-icon mat-icon-filled" style={{ fontSize: 20 }}>{icon}</span>
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* About */}
          {prof && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="mat-icon" style={{ fontSize: 18 }}>info</span>
                  Sobre nosotros
                </div>
              </div>
              <div className="card-body">
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{prof.description}</p>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Certificaciones
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {prof.certifications.map(cert => (
                      <span key={cert} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 20,
                        background: 'var(--success-bg)', border: '1px solid var(--success)',
                        color: 'var(--success)', fontSize: 12, fontWeight: 700,
                      }}>
                        <span className="mat-icon mat-icon-filled" style={{ fontSize: 13 }}>verified</span>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Empresa
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Empleados: </span>
                      <span style={{ fontWeight: 600 }}>{prof.employeeCount}</span>
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Fundada: </span>
                      <span style={{ fontWeight: 600 }}>{2026 - prof.yearsInBusiness}</span>
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ubicación: </span>
                      <span style={{ fontWeight: 600 }}>{prof.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category grid */}
          {prof && prof.categories.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="mat-icon" style={{ fontSize: 18 }}>category</span>
                  Categorías que ofrece
                </div>
              </div>
              <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {prof.categories.map(catKey => {
                  const meta = CATEGORY_META[catKey]
                  if (!meta) return null
                  return (
                    <Link
                      key={catKey}
                      to={`/catalog/${catKey}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10,
                        border: '1.5px solid var(--border)', background: '#fff',
                        transition: 'all 0.15s ease', cursor: 'pointer',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                      >
                        <div style={{ width: 36, height: 36, background: meta.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {meta.icon}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                          {catKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: contact/quote card */}
        <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isBuyer && prof && (
            <div className="card">
              <div className="card-header" style={{ padding: '16px 20px' }}>
                <div className="card-title" style={{ fontSize: 14 }}>
                  <span className="mat-icon" style={{ fontSize: 18 }}>request_quote</span>
                  Iniciar cotización
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Categoría <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {prof.categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mensaje (opcional)</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: 80, resize: 'vertical', fontSize: 13 }}
                    placeholder="Describe brevemente tu necesidad..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(`/rfqs/new?category=${selectedCategory}&supplier=${id}`)}
                >
                  <span className="mat-icon" style={{ fontSize: 18 }}>rocket_launch</span>
                  Crear RFQ con este proveedor
                </button>
              </div>
            </div>
          )}

          {prof && (
            <div className="card">
              <div className="card-header" style={{ padding: '14px 20px' }}>
                <div className="card-title" style={{ fontSize: 14 }}>Calificación</div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>{prof.rating.toFixed(1)}</span>
                  <div>
                    <StarRating rating={prof.rating} />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Basado en {prof.completedOrders} pedidos completados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
