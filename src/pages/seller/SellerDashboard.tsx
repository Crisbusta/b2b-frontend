import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listRFQs } from '../../api/client'
import type { RFQ } from '../../types/dto'
import { MOCK_ORDERS } from '../../data/mockData'
import SellerLayout from '../../components/SellerLayout'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const BUYER_NAMES: Record<string, string> = {
  'buyer-1': 'Constructora Norte S.A.',
  'buyer-2': 'Minera Atacama Ltda.',
}

const PIPELINE_PHASES = ['Confirmado', 'Producción', 'QC', 'Despacho', 'Tránsito', 'Entregado']

const ORDER_STATUS_PHASE: Record<string, number> = {
  confirmed: 0,
  in_production: 1,
  quality_check: 2,
  ready_dispatch: 3,
  in_transit: 4,
  delivered: 5,
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const tenantId = localStorage.getItem('tenantCompanyId') ?? ''

  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listRFQs().then(all => {
      const invited = all.filter(r =>
        r.status === 'published' && r.invitedSupplierCompanyIds.includes(tenantId)
      )
      setRfqs(invited)
    }).finally(() => setLoading(false))
  }, [tenantId])

  const myOrders = MOCK_ORDERS.filter(o => o.supplierCompanyId === tenantId)
  const monthSales = myOrders.reduce((sum, o) => sum + o.totalAmountCLP, 0)
  const monthGoal = 10_000_000
  const salesProgress = Math.min(100, Math.round((monthSales / monthGoal) * 100))
  const inTransitOrder = myOrders.find(o => o.status === 'in_transit')

  const metrics = [
    { label: 'Solicitudes activas', value: rfqs.length, icon: 'inbox', color: 'var(--primary)' },
    { label: 'En producción',       value: myOrders.filter(o => o.status === 'in_production').length, icon: 'precision_manufacturing', color: 'var(--warning)' },
    { label: 'Ventas del mes',      value: formatCLP(monthSales), icon: 'payments', color: 'var(--success)' },
    { label: 'Tiempo respuesta',    value: '1.2d', icon: 'speed', color: 'var(--info)' },
  ]

  return (
    <SellerLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Centro Vendedor</h1>
          <p className="page-subtitle">Gestiona cotizaciones, pedidos e inventario</p>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {metrics.map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ color }}>
              <span className="mat-icon mat-icon-filled" style={{ fontSize: 20 }}>{icon}</span>
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions Required */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span className="mat-icon" style={{ fontSize: 16, color: 'var(--accent)' }}>priority_high</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Acciones prioritarias</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {/* Card 1 — new RFQ */}
          <div style={{ background: '#fff7f4', border: '1.5px solid #fbd4c0', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="mat-icon mat-icon-filled" style={{ fontSize: 18, color: '#fff' }}>request_quote</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Nueva RFQ para cotizar</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{rfqs.length} solicitud{rfqs.length !== 1 ? 'es' : ''} activa{rfqs.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <button className="btn btn-accent btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/seller/quotes')}>
              Responder ahora
            </button>
          </div>

          {/* Card 2 — order in transit */}
          <div style={{ background: '#f0f6ff', border: '1.5px solid #bfd7ff', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="mat-icon mat-icon-filled" style={{ fontSize: 18, color: '#fff' }}>local_shipping</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Pedido en seguimiento</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {inTransitOrder ? 'En tránsito — actualizar estado' : 'Sin pedidos en tránsito'}
                </div>
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ width: '100%', justifyContent: 'center', background: 'var(--primary)', color: '#fff', border: 'none' }}
              onClick={() => inTransitOrder ? navigate(`/orders/${inTransitOrder.id}`) : navigate('/orders')}
            >
              Ver pedido
            </button>
          </div>

          {/* Card 3 — documents */}
          <div style={{ background: '#fffbf0', border: '1.5px solid #ffe49e', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="mat-icon mat-icon-filled" style={{ fontSize: 18, color: '#fff' }}>description</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Documentos técnicos</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>3 fichas pendientes de actualizar</div>
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ width: '100%', justifyContent: 'center', background: '#f59e0b', color: '#fff', border: 'none' }}
              onClick={() => navigate('/seller/inventory')}
            >
              Gestionar inventario
            </button>
          </div>
        </div>
      </div>

      {/* Active RFQs */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            <span className="mat-icon" style={{ fontSize: 18 }}>inbox</span>
            Solicitudes de cotización activas
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/seller/rfqs')}>
            <span className="mat-icon" style={{ fontSize: 15 }}>open_in_new</span>
            Ver todas
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Cargando solicitudes...
          </div>
        ) : rfqs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><span className="mat-icon mat-icon-lg">inbox</span></div>
            <div className="empty-state-title">Sin solicitudes activas</div>
            <div className="empty-state-desc">No tienes RFQs pendientes por cotizar en este momento.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Comprador</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map(rfq => (
                <tr key={rfq.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{rfq.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{rfq.id}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{BUYER_NAMES[rfq.buyerCompanyId] ?? rfq.buyerCompanyId}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'var(--primary-light)', color: 'var(--primary)',
                    }}>
                      {rfq.categoryKey.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(rfq.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-accent" onClick={() => navigate('/seller/quotes')}>
                        Cotizar
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/rfqs/${rfq.id}`)}>
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Production Pipeline */}
      {myOrders.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">
              <span className="mat-icon" style={{ fontSize: 18 }}>account_tree</span>
              Pipeline de producción
            </div>
          </div>
          <div style={{ padding: '8px 24px 20px' }}>
            {myOrders.map(order => {
              const phaseIdx = ORDER_STATUS_PHASE[order.status] ?? 4
              return (
                <div key={order.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{order.rfqTitle}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>{BUYER_NAMES[order.buyerCompanyId] ?? order.buyerCompanyId}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>{formatCLP(order.totalAmountCLP)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {PIPELINE_PHASES.map((phase, idx) => {
                      const isDone = idx < phaseIdx
                      const isCurrent = idx === phaseIdx
                      return (
                        <div key={phase} style={{ display: 'flex', alignItems: 'center', flex: idx < PIPELINE_PHASES.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%',
                              background: isCurrent ? 'var(--accent)' : isDone ? 'var(--success)' : 'var(--border)',
                              border: isCurrent ? '2px solid var(--accent)' : isDone ? '2px solid var(--success)' : '2px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {isDone ? (
                                <span className="mat-icon" style={{ fontSize: 13, color: '#fff' }}>check</span>
                              ) : (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isCurrent ? '#fff' : 'var(--text-muted)' }} />
                              )}
                            </div>
                            <span style={{
                              fontSize: 9, fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? 'var(--accent)' : isDone ? 'var(--success)' : 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                            }}>{phase}</span>
                          </div>
                          {idx < PIPELINE_PHASES.length - 1 && (
                            <div style={{
                              flex: 1, height: 2, background: isDone ? 'var(--success)' : 'var(--border)',
                              margin: '0 2px', marginBottom: 18,
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Live Inquiries Feed */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            <span className="mat-icon" style={{ fontSize: 18 }}>notifications_active</span>
            Actividad reciente
          </div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {[
            {
              icon: 'chat_bubble',
              color: 'var(--primary)',
              bg: 'var(--primary-light)',
              title: 'Mensaje de comprador',
              desc: 'Constructora Norte S.A. pregunta sobre especificaciones técnicas de tubería DN110.',
              time: 'hace 23 min',
            },
            {
              icon: 'campaign',
              color: 'var(--accent)',
              bg: '#fff0ea',
              title: 'Nueva RFQ coincide con tu catálogo',
              desc: 'RFQ-2025-0042: Válvulas compuerta 316L — 40 unidades, Región Atacama.',
              time: 'hace 1h',
            },
            {
              icon: 'verified',
              color: 'var(--success)',
              bg: 'var(--success-bg)',
              title: 'Orden adjudicada lista para producción',
              desc: 'Geomembrana HDPE 1.5mm — Tranque Norte confirmada. Iniciar fabricación.',
              time: 'hace 2h',
            },
          ].map(({ icon, color, bg, title, desc, time }) => (
            <div key={title} style={{ display: 'flex', gap: 14, padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <span className="mat-icon mat-icon-filled" style={{ fontSize: 17, color }}>{icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>{time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Performance */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            <span className="mat-icon" style={{ fontSize: 18 }}>bar_chart</span>
            Rendimiento de ventas
          </div>
          <button className="btn btn-sm btn-ghost" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Ver reporte
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Ventas del mes</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>{salesProgress}% de la meta</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${salesProgress}%`, background: 'var(--success)', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatCLP(monthSales)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Meta: {formatCLP(monthGoal)}</span>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>68%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Win Rate</div>
            </div>
            <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                {myOrders.length > 0 ? formatCLP(Math.round(monthSales / myOrders.length)) : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Cotiz. promedio</div>
            </div>
            <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{myOrders.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Pedidos activos</div>
            </div>
          </div>
        </div>
      </div>

      {/* My orders */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="mat-icon" style={{ fontSize: 18 }}>inventory_2</span>
            Mis pedidos adjudicados
          </div>
        </div>

        {myOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><span className="mat-icon mat-icon-lg">inventory_2</span></div>
            <div className="empty-state-title">Sin pedidos aún</div>
            <div className="empty-state-desc">Cuando ganes una licitación, tus pedidos aparecerán aquí.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Comprador</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{order.rfqTitle}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.id}</div>
                  </td>
                  <td>{BUYER_NAMES[order.buyerCompanyId] ?? order.buyerCompanyId}</td>
                  <td>
                    <span className="badge badge-published">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCLP(order.totalAmountCLP)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SellerLayout>
  )
}
