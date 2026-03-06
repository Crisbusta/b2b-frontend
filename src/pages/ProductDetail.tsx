import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getTemplate, listCompanies } from '../api/client'
import type { Template, Company } from '../types/dto'
import { CATEGORY_META } from './CatalogPage'
import { SUPPLIER_PROFILES } from '../data/mockData'

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}>
          <span className="mat-icon mat-icon-filled" style={{ fontSize: 14 }}>star</span>
        </span>
      ))}
      <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

export default function ProductDetail() {
  const { categoryKey } = useParams<{ categoryKey: string }>()
  const navigate = useNavigate()
  const role = localStorage.getItem('userRole') ?? ''
  const isBuyer = role === 'buyer_user' || role === 'company_admin'

  const [template, setTemplate] = useState<Template | null>(null)
  const [suppliers, setSuppliers] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categoryKey) return
    Promise.all([
      getTemplate(categoryKey),
      listCompanies('supplier'),
    ]).then(([t, s]) => {
      setTemplate(t)
      // Filter suppliers that have this category in their profile
      const relevant = s.filter(sup => {
        const prof = SUPPLIER_PROFILES[sup.id]
        return prof && prof.categories.includes(categoryKey)
      })
      setSuppliers(relevant.length > 0 ? relevant : s.slice(0, 3))
    }).finally(() => setLoading(false))
  }, [categoryKey])

  if (loading) return (
    <div style={{ padding: '40px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Cargando ficha técnica...
    </div>
  )

  if (!template) return (
    <div className="alert alert-error">Categoría no encontrada.</div>
  )

  const meta = CATEGORY_META[template.categoryKey] ?? { icon: null, color: '#E2E8F0', desc: '', tags: [] }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/catalog">Vitrina</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{template.name}</span>
      </div>

      {/* Hero strip */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #2d5a9a 100%)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ width: 64, height: 64, background: meta.color, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 6 }}>
            {template.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.5 }}>{meta.desc}</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {meta.tags.map(tag => (
              <span key={tag} className="spec-chip" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        {isBuyer && (
          <button
            className="btn btn-accent"
            style={{ flexShrink: 0 }}
            onClick={() => navigate(`/rfqs/new?category=${categoryKey}`)}
          >
            <span className="mat-icon" style={{ fontSize: 18 }}>add</span>
            Crear RFQ
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left: specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Technical attributes table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="mat-icon" style={{ fontSize: 18 }}>engineering</span>
                Especificaciones técnicas
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {template.attributes.length} atributos · {template.attributes.filter(a => a.required).length} requeridos
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Atributo</th>
                    <th>Tipo</th>
                    <th>Unidad / Valores</th>
                    <th>Requerido</th>
                  </tr>
                </thead>
                <tbody>
                  {template.attributes.map(attr => (
                    <tr key={attr.key}>
                      <td style={{ fontWeight: 600 }}>{attr.label}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          {attr.type}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280 }}>
                        {attr.unit && <span style={{ fontWeight: 600, color: 'var(--text)' }}>{attr.unit} · </span>}
                        {attr.enumValues ? attr.enumValues.join(' · ') : '—'}
                      </td>
                      <td>
                        {attr.required ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--danger)', fontSize: 12, fontWeight: 700 }}>
                            <span className="mat-icon mat-icon-filled" style={{ fontSize: 13 }}>check_circle</span> Sí
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Opcional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Description / use cases */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="mat-icon" style={{ fontSize: 18 }}>info</span>
                Descripción y usos
              </div>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {meta.desc}
              </p>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {meta.tags.map(tag => (
                  <span key={tag} className="spec-chip">
                    <span className="mat-icon" style={{ fontSize: 13 }}>label</span>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: sticky sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
          {/* Suppliers available */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: 14 }}>
                <span className="mat-icon" style={{ fontSize: 18 }}>storefront</span>
                Proveedores disponibles
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{suppliers.length} activos</span>
            </div>
            <div>
              {suppliers.map(sup => {
                const prof = SUPPLIER_PROFILES[sup.id]
                return (
                  <div key={sup.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                      <Link
                        to={`/suppliers/${sup.id}`}
                        style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        {sup.name}
                      </Link>
                      {prof && <StarRating rating={prof.rating} />}
                    </div>
                    {prof && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <span className="mat-icon" style={{ fontSize: 12, verticalAlign: 'middle' }}>schedule</span>
                        {' '}{prof.avgResponseDays} día{prof.avgResponseDays !== 1 ? 's' : ''} respuesta · {prof.completedOrders} pedidos
                      </div>
                    )}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                      onClick={() => navigate(`/rfqs/new?category=${categoryKey}&supplier=${sup.id}`)}
                    >
                      <span className="mat-icon" style={{ fontSize: 14 }}>add</span>
                      Cotizar con este proveedor
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Create RFQ CTA */}
          {isBuyer && (
            <div style={{
              background: 'var(--primary)', borderRadius: 'var(--radius-lg)', padding: '20px',
            }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                ¿Necesitas cotización?
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5, marginBottom: 16 }}>
                Crea una RFQ con esta categoría e invita proveedores a cotizar con especificaciones estandarizadas.
              </p>
              <button
                className="btn btn-accent"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/rfqs/new?category=${categoryKey}`)}
              >
                <span className="mat-icon" style={{ fontSize: 18 }}>rocket_launch</span>
                Crear RFQ
              </button>
            </div>
          )}

          {/* Back to catalog */}
          <Link to="/catalog" className="btn btn-ghost" style={{ justifyContent: 'center', textDecoration: 'none' }}>
            <span className="mat-icon" style={{ fontSize: 16 }}>arrow_back</span>
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
