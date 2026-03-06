import { useState } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { INVENTORY_MOCK, MOCK_ORDERS } from '../../data/mockData'
import SellerLayout from '../../components/SellerLayout'

type InventoryStatus = 'active' | 'draft' | 'inactive'

const STATUS_LABELS: Record<InventoryStatus, string> = {
  active:   'Activo',
  draft:    'Borrador',
  inactive: 'Inactivo',
}

const STATUS_STYLE: Record<InventoryStatus, { bg: string; color: string }> = {
  active:   { bg: 'var(--success-bg)', color: 'var(--success)' },
  draft:    { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  inactive: { bg: 'var(--bg)',         color: 'var(--text-muted)' },
}

const CATEGORY_LABELS: Record<string, string> = {
  pipe_pead_thermofusion:  'Tubería PEAD',
  valvula_compuerta_acero: 'Válvulas',
  cable_electrico_mt:      'Cable MT',
  perfil_acero_estructural: 'Perfiles Acero',
  hormigon_premezclado:    'Hormigón',
  geomembrana_hdpe:        'Geomembrana',
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function SellerInventory() {
  const { addToast } = useToast()
  const tenantId = localStorage.getItem('tenantCompanyId') ?? ''
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<InventoryStatus | 'all'>('all')
  const [selectedSku, setSelectedSku] = useState<string | null>(null)

  const myOrders = MOCK_ORDERS.filter(o => o.supplierCompanyId === tenantId)
  const productionKPIs = [
    { label: 'En fabricación',          value: myOrders.filter(o => o.status === 'in_production').length, icon: 'precision_manufacturing', color: 'var(--warning)' },
    { label: 'En control de calidad',   value: 0, icon: 'verified', color: 'var(--info)' },
    { label: 'Listo para despacho',     value: myOrders.filter(o => o.status === 'in_transit').length, icon: 'local_shipping', color: 'var(--success)' },
    { label: 'Tiempo prom. producción', value: '14.2d', icon: 'schedule', color: 'var(--primary)' },
  ]

  const filtered = INVENTORY_MOCK.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusTab === 'all' || item.status === statusTab
    return matchSearch && matchStatus
  })

  const selectedItem = selectedSku ? INVENTORY_MOCK.find(i => i.sku === selectedSku) : null

  return (
    <SellerLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario & Catálogo</h1>
          <p className="page-subtitle">Gestiona tus productos y precios de referencia</p>
        </div>
        <button className="btn btn-primary" onClick={() => addToast('Agregar producto — próximamente', 'info')}>
          <span className="mat-icon" style={{ fontSize: 18 }}>add</span>
          Agregar producto
        </button>
      </div>

      {/* Production KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {productionKPIs.map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ color }}>
              <span className="mat-icon mat-icon-filled" style={{ fontSize: 20 }}>{icon}</span>
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 360px' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Main table */}
        <div>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="input-with-icon" style={{ flex: '1 1 220px' }}>
              <span className="icon-prefix"><span className="mat-icon" style={{ fontSize: 16 }}>search</span></span>
              <input
                className="form-input"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {(['all', 'active', 'draft', 'inactive'] as const).map(tab => (
                <button
                  key={tab}
                  className={`filter-tab${statusTab === tab ? ' active' : ''}`}
                  onClick={() => setStatusTab(tab)}
                >
                  {tab === 'all' ? 'Todos' : STATUS_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><span className="mat-icon mat-icon-lg">search_off</span></div>
                <div className="empty-state-title">Sin resultados</div>
                <div className="empty-state-desc">Intenta con otro filtro o término de búsqueda.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>P. Ref.</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const style = STATUS_STYLE[item.status]
                    const isSelected = selectedSku === item.sku
                    return (
                      <tr
                        key={item.sku}
                        style={{ cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : undefined }}
                        onClick={() => setSelectedSku(isSelected ? null : item.sku)}
                      >
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{item.sku}</td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 7px', borderRadius: 6 }}>
                            {CATEGORY_LABELS[item.category] ?? item.category}
                          </span>
                        </td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {formatCLP(item.priceRef)}
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.stock.toLocaleString('es-CL')}</td>
                        <td>
                          <span className="badge" style={{ background: style.bg, color: style.color }}>
                            {STATUS_LABELS[item.status]}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-ghost" onClick={() => addToast('Editor de producto — próximamente', 'info')}>
                              <span className="mat-icon" style={{ fontSize: 14 }}>edit</span>
                            </button>
                            {item.status !== 'active' && (
                              <button className="btn btn-sm btn-ghost" onClick={() => addToast('Activar producto — próximamente', 'info')}>
                                <span className="mat-icon" style={{ fontSize: 14 }}>toggle_on</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: 14 }}>Ficha técnica</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                onClick={() => setSelectedSku(null)}
              >
                <span className="mat-icon" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{selectedItem.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: 16 }}>{selectedItem.sku}</div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>{formatCLP(selectedItem.priceRef)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Precio ref.</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--success)' }}>{selectedItem.stock.toLocaleString('es-CL')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unidades</div>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
                Especificaciones
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(selectedItem.specs).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {k.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{String(v)}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-outline-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                onClick={() => addToast('Editor de producto — próximamente', 'info')}
              >
                <span className="mat-icon" style={{ fontSize: 16 }}>edit</span>
                Editar producto
              </button>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  )
}
