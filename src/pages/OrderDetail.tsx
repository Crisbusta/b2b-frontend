import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../api/client'
import type { Order, OrderStatus } from '../types/dto'
import { SUPPLIER_PROFILES } from '../data/mockData'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

type TimelineStep = { key: OrderStatus; label: string; sub: string }

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'confirmed',     label: 'Pedido confirmado',  sub: 'Orden de compra emitida' },
  { key: 'in_production', label: 'En fabricación',     sub: 'Proveedor en producción' },
  { key: 'quality_check', label: 'Control de calidad', sub: 'Inspección pre-despacho' },
  { key: 'export',        label: 'Exportación',         sub: 'Documentación aduanera' },
  { key: 'in_transit',    label: 'En tránsito',         sub: 'Camino al destino' },
]

const STATUS_ORDER: OrderStatus[] = ['confirmed', 'in_production', 'quality_check', 'export', 'in_transit', 'delivered']

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed:     'Confirmado',
  in_production: 'En Producción',
  quality_check: 'Control Calidad',
  export:        'Exportación',
  in_transit:    'En Tránsito',
  delivered:     'Entregado',
}

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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getOrder(id).then(setOrder).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ padding: '40px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Cargando pedido...
    </div>
  )

  if (!order) return <div className="alert alert-error">Pedido no encontrado.</div>

  const currentIdx = STATUS_ORDER.indexOf(order.status)
  const prof = SUPPLIER_PROFILES[order.supplierCompanyId]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/orders">Pedidos</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{order.rfqTitle}</span>
      </div>

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px 28px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                <span className="mat-icon" style={{ fontSize: 12 }}>local_shipping</span>
                {STATUS_LABELS[order.status]}
              </span>
              {order.trackingNumber !== '—' && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                  {order.trackingNumber}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
              {order.rfqTitle}
            </h1>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Pedido {order.id} · Creado {new Date(order.createdAt).toLocaleDateString('es-CL')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatCLP(order.totalAmountCLP)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Total + IVA</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="mat-icon" style={{ fontSize: 18 }}>route</span>
                Estado del envío
              </div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div className="order-timeline">
                {TIMELINE_STEPS.map((step, i) => {
                  const stepIdx = STATUS_ORDER.indexOf(step.key)
                  const state = stepIdx < currentIdx ? 'done' : stepIdx === currentIdx ? 'current' : 'pending'
                  const isLast = i === TIMELINE_STEPS.length - 1

                  return (
                    <div key={step.key}>
                      <div className="order-timeline-step">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div className={`order-timeline-dot ${state}`}>
                            {state === 'done'
                              ? <span className="mat-icon mat-icon-filled" style={{ fontSize: 15 }}>check</span>
                              : <span style={{ fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                            }
                          </div>
                          {!isLast && (
                            <div className={`order-timeline-line ${state === 'done' ? 'done' : ''}`} />
                          )}
                        </div>
                        <div style={{ paddingBottom: isLast ? 0 : 4, paddingTop: 4 }}>
                          <div style={{
                            fontSize: 14, fontWeight: state === 'current' ? 700 : 600,
                            color: state === 'done' ? 'var(--success)' : state === 'current' ? 'var(--primary)' : 'var(--text-muted)',
                            marginBottom: 2,
                          }}>
                            {step.label}
                            {state === 'current' && (
                              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', background: 'var(--accent-light)', padding: '1px 6px', borderRadius: 4 }}>
                                Activo
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{step.sub}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Delivered final step */}
                <div className="order-timeline-step">
                  <div style={{ flexShrink: 0 }}>
                    <div className={`order-timeline-dot ${order.status === 'delivered' ? 'done' : 'pending'}`}>
                      {order.status === 'delivered'
                        ? <span className="mat-icon mat-icon-filled" style={{ fontSize: 15 }}>check</span>
                        : <span style={{ fontSize: 12, fontWeight: 800 }}>6</span>
                      }
                    </div>
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: order.status === 'delivered' ? 700 : 600, color: order.status === 'delivered' ? 'var(--success)' : 'var(--text-muted)' }}>
                      Entregado
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Recepción en destino</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="mat-icon" style={{ fontSize: 18 }}>inventory</span>
                Ítems del pedido
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ítem</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>P. Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.rfqItemId}</td>
                      <td style={{ fontWeight: 600 }}>{item.quantity.toLocaleString('es-CL')}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCLP(item.unitPriceCLP)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCLP(item.quantity * item.unitPriceCLP)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--bg)' }}>
                    <td colSpan={4} style={{ fontWeight: 700, textAlign: 'right' }}>Total</td>
                    <td style={{ fontWeight: 900, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCLP(order.totalAmountCLP)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
          {/* Order summary */}
          <div className="card">
            <div className="card-header" style={{ padding: '14px 20px' }}>
              <div className="card-title" style={{ fontSize: 14 }}>Resumen del pedido</div>
            </div>
            <div style={{ padding: '4px 20px 12px' }}>
              {[
                { label: 'Incoterms',     val: order.incoterms },
                { label: 'Carrier',       val: order.carrier },
                { label: 'Origen',        val: order.shippingOrigin },
                { label: 'Entrega est.',  val: `${order.estimatedDeliveryDays} días hábiles` },
                { label: 'Tracking',      val: order.trackingNumber },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier card */}
          {prof && (
            <div className="card">
              <div className="card-header" style={{ padding: '14px 20px' }}>
                <div className="card-title" style={{ fontSize: 14 }}>Proveedor</div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <Link to={`/suppliers/${order.supplierCompanyId}`} style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                  {({ 'sup-1': 'Proveedora Aceros del Pacífico', 'sup-2': 'Tuberías del Sur S.A.', 'sup-3': 'Electro Industrial SpA', 'sup-4': 'HormigonSur Ltda.' } as Record<string, string>)[order.supplierCompanyId] ?? order.supplierCompanyId}
                </Link>
                <StarRating rating={prof.rating} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  <span className="mat-icon" style={{ fontSize: 13, verticalAlign: 'middle' }}>location_on</span>
                  {' '}{prof.location}
                </div>
                <Link
                  to={`/suppliers/${order.supplierCompanyId}`}
                  className="btn btn-sm btn-outline-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 12, textDecoration: 'none' }}
                >
                  Ver perfil completo
                </Link>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="card">
            <div className="card-header" style={{ padding: '14px 20px' }}>
              <div className="card-title" style={{ fontSize: 14 }}>
                <span className="mat-icon" style={{ fontSize: 18 }}>description</span>
                Documentos
              </div>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Factura Electrónica', icon: 'receipt' },
                { label: 'Orden de Compra',     icon: 'shopping_cart' },
                { label: 'Certificado Calidad',  icon: 'verified' },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                  onClick={() => {}}
                >
                  <span className="mat-icon" style={{ fontSize: 15 }}>{icon}</span>
                  {label}
                  <span className="mat-icon" style={{ fontSize: 14, marginLeft: 'auto', color: 'var(--text-light)' }}>download</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
