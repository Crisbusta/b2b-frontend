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

type TabFilter = 'all' | 'pending' | 'responded'

export default function SellerRFQList() {
  const navigate = useNavigate()
  const tenantId = localStorage.getItem('tenantCompanyId') ?? ''

  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabFilter>('all')

  useEffect(() => {
    listRFQs().then(all => {
      const invited = all.filter(r => r.invitedSupplierCompanyIds.includes(tenantId))
      setRfqs(invited)
    }).finally(() => setLoading(false))
  }, [tenantId])

  const myOrders = MOCK_ORDERS.filter(o => o.supplierCompanyId === tenantId)
  const pipeline = myOrders.reduce((sum, o) => sum + o.totalAmountCLP, 0)
  const activeRFQs = rfqs.filter(r => r.status === 'published')
  const expiringCount = 1 // mock: 1 expira en 48h

  const filtered = rfqs.filter(r => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (BUYER_NAMES[r.buyerCompanyId] ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTab =
      tab === 'all' ||
      (tab === 'pending' && r.status === 'published') ||
      (tab === 'responded' && r.status !== 'published')
    return matchSearch && matchTab
  })

  return (
    <SellerLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes de Cotización</h1>
          <p className="page-subtitle">RFQs donde fuiste invitado a cotizar</p>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)' }}>
            <span className="mat-icon mat-icon-filled" style={{ fontSize: 20 }}>inbox</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{activeRFQs.length}</div>
          <div className="stat-label">Solicitudes activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--warning)' }}>
            <span className="mat-icon mat-icon-filled" style={{ fontSize: 20 }}>schedule</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{expiringCount}</div>
          <div className="stat-label">Expiran en 48h</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}>
            <span className="mat-icon mat-icon-filled" style={{ fontSize: 20 }}>payments</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{formatCLP(pipeline)}</div>
          <div className="stat-label">Pipeline estimado</div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: '1 1 260px' }}>
          <span className="icon-prefix"><span className="mat-icon" style={{ fontSize: 16 }}>search</span></span>
          <input
            className="form-input"
            placeholder="Buscar por RFQ, comprador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {(['all', 'pending', 'responded'] as const).map(t => (
            <button
              key={t}
              className={`filter-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'all' ? 'Todas' : t === 'pending' ? 'Pendientes' : 'Respondidas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Cargando solicitudes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><span className="mat-icon mat-icon-lg">inbox</span></div>
            <div className="empty-state-title">Sin solicitudes</div>
            <div className="empty-state-desc">No hay RFQs que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>RFQ</th>
                  <th>Comprador</th>
                  <th>Categoría</th>
                  <th>Ítems</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rfq => (
                  <tr key={rfq.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{rfq.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{rfq.id}</div>
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
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{rfq.items.length}</td>
                    <td>
                      <span className={`badge badge-${rfq.status}`}>
                        {rfq.status === 'published' ? 'Pendiente' : rfq.status === 'awarded' ? 'Adjudicado' : rfq.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {rfq.status === 'published' && (
                          <button
                            className="btn btn-sm btn-accent"
                            onClick={() => navigate('/seller/quotes')}
                          >
                            Cotizar
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => navigate(`/rfqs/${rfq.id}`)}
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
              Mostrando {filtered.length} de {rfqs.length} solicitudes
            </div>
          </>
        )}
      </div>
    </SellerLayout>
  )
}
