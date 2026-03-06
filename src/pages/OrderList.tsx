import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listOrders } from '../api/client'
import type { Order, OrderStatus } from '../types/dto'

const SUPPLIER_NAMES: Record<string, string> = {
  'sup-1': 'Proveedora Aceros del Pacífico',
  'sup-2': 'Tuberías del Sur S.A.',
  'sup-3': 'Electro Industrial SpA',
  'sup-4': 'HormigonSur Ltda.',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed:     'Confirmado',
  in_production: 'En Producción',
  quality_check: 'Control Calidad',
  export:        'Exportación',
  in_transit:    'En Tránsito',
  delivered:     'Entregado',
}

const STATUS_BADGE_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  confirmed:     { bg: 'var(--info-bg)',     color: 'var(--info)' },
  in_production: { bg: 'var(--warning-bg)',  color: 'var(--warning)' },
  quality_check: { bg: 'var(--purple-bg)',   color: 'var(--purple)' },
  export:        { bg: 'var(--primary-light)', color: 'var(--primary)' },
  in_transit:    { bg: 'var(--accent-light)', color: 'var(--accent)' },
  delivered:     { bg: 'var(--success-bg)',  color: 'var(--success)' },
}

const FILTER_TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all',           label: 'Todos' },
  { key: 'in_production', label: 'En Producción' },
  { key: 'in_transit',    label: 'En Tránsito' },
  { key: 'delivered',     label: 'Entregados' },
]

const SHIPPING_STEPS = ['confirmed','in_production','quality_check','export','in_transit','delivered'] as const
const STEP_LABELS: Record<string, string> = {
  confirmed: 'Confirmado', in_production: 'Producción',
  quality_check: 'Control calidad', export: 'Exportación',
  in_transit: 'En tránsito', delivered: 'Entregado',
}
const MINI_LABELS = ['Producción', 'Tránsito', 'Aduanas', 'Entregado']

function getProgressPct(status: string): number {
  const idx = SHIPPING_STEPS.indexOf(status as typeof SHIPPING_STEPS[number])
  return idx < 0 ? 0 : Math.round(((idx + 1) / SHIPPING_STEPS.length) * 100)
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function OrderList() {
  const navigate = useNavigate()
  const tenantId = localStorage.getItem('tenantCompanyId') ?? ''
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all')
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listOrders(tenantId).then(setOrders).finally(() => setLoading(false))
  }, [tenantId])

  const historyFiltered = showHistory
    ? orders.filter(o => o.status === 'delivered')
    : orders.filter(o => o.status !== 'delivered')

  const filtered = activeTab === 'all' ? historyFiltered : historyFiltered.filter(o => o.status === activeTab)

  const customsCount = orders.filter(o => o.status === 'export').length
  const delayedOrders = orders.filter(o => o.trackingNumber === '—' || o.status === 'export')

  const statCards = [
    { label: 'Total pedidos', value: orders.length,                                icon: 'inventory_2',    color: 'var(--primary)',  bg: 'var(--primary-light)' },
    { label: 'En tránsito',   value: orders.filter(o => o.status === 'in_transit').length, icon: 'local_shipping', color: 'var(--accent)',   bg: 'var(--accent-light)' },
    { label: 'Entregados',    value: orders.filter(o => o.status === 'delivered').length,  icon: 'check_circle',   color: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'En Aduanas',    value: customsCount,                                icon: 'account_balance', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  ]

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 className="page-title">Órdenes & Logística</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Seguimiento de pedidos adjudicados</p>
          </div>
          <div className="filter-tabs" style={{ fontSize: 12 }}>
            <button className={`filter-tab ${!showHistory ? 'active' : ''}`} onClick={() => setShowHistory(false)}>
              Activas
            </button>
            <button className={`filter-tab ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(true)}>
              Historial
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm">
            <span className="mat-icon" style={{ fontSize: 16 }}>download</span> Descargar facturas
          </button>
          <button className="btn btn-accent btn-sm">
            <span className="mat-icon" style={{ fontSize: 16 }}>ios_share</span> Exportar envíos
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="mat-icon mat-icon-filled" style={{ fontSize: 22, color }}>{icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      {!showHistory && (
        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          {FILTER_TABS.filter(t => t.key !== 'delivered').map(({ key, label }) => (
            <button
              key={key}
              className={`filter-tab${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700 }}>
                ({key === 'all' ? historyFiltered.length : historyFiltered.filter(o => o.status === key).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Cargando pedidos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="mat-icon mat-icon-lg">inventory_2</span>
            </div>
            <div className="empty-state-title">Sin pedidos</div>
            <div className="empty-state-desc">No hay pedidos en esta categoría aún.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Proveedor</th>
                <th>Valor total</th>
                <th>Estado del Envío</th>
                <th>Entrega est.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const pct = getProgressPct(order.status)
                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{order.rfqTitle}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.id}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{SUPPLIER_NAMES[order.supplierCompanyId] ?? order.supplierCompanyId}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCLP(order.totalAmountCLP)}
                    </td>
                    <td style={{ minWidth: 260 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                          {STEP_LABELS[order.status]}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div className="order-progress-track">
                        <div className="order-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        {MINI_LABELS.map(s => (
                          <span key={s} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {order.estimatedDeliveryDays} días
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-primary" style={{ textDecoration: 'none' }}>
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Required */}
      {!loading && delayedOrders.length > 0 && (
        <div className="attention-card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="mat-icon" style={{ color: 'var(--warning)', fontSize: 20 }}>warning</span>
            <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Acción Requerida — Envíos con retraso
            </span>
          </div>
          {delayedOrders.map(order => (
            <div key={order.id} className="attention-card-item">
              <span style={{ fontSize: 13 }}>
                <strong>{order.id}</strong> — {order.rfqTitle}
              </span>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/orders/${order.id}`)}>
                REVISAR →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
