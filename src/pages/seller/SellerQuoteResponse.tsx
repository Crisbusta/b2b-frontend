import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listRFQs, getRFQ, createQuote } from '../../api/client'
import type { RFQ, CreateQuoteItemReq } from '../../types/dto'
import { useToast } from '../../contexts/ToastContext'
import SellerLayout from '../../components/SellerLayout'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DDP', 'DAP', 'FCA']
const CURRENCIES = ['CLP', 'USD', 'EUR']

export default function SellerQuoteResponse() {
  const navigate  = useNavigate()
  const { addToast } = useToast()
  const tenantId  = localStorage.getItem('tenantCompanyId') ?? ''

  const [rfqs,        setRfqs]       = useState<RFQ[]>([])
  const [selected,    setSelected]   = useState<RFQ | null>(null)
  const [prices,      setPrices]     = useState<Record<string, number>>({})
  const [currency,    setCurrency]   = useState('CLP')
  const [leadTime,    setLeadTime]   = useState(14)
  const [incoterms,   setIncoterms]  = useState('DDP')
  const [origin,      setOrigin]     = useState('')
  const [validUntil,  setValidUntil] = useState('')
  const [saving,      setSaving]     = useState(false)
  const [loadingRfqs, setLoadingRfqs] = useState(true)

  useEffect(() => {
    listRFQs().then(all => {
      const invited = all.filter(r =>
        r.status === 'published' && r.invitedSupplierCompanyIds.includes(tenantId)
      )
      setRfqs(invited)
    }).finally(() => setLoadingRfqs(false))
  }, [tenantId])

  async function selectRFQ(rfq: RFQ) {
    const full = await getRFQ(rfq.id).catch(() => rfq)
    setSelected(full)
    // Initialize prices to 0 for each item
    const init: Record<string, number> = {}
    full.items.forEach(item => { init[item.id] = 0 })
    setPrices(init)
  }

  const totalEstimate = selected
    ? selected.items.reduce((sum, item) => sum + (prices[item.id] ?? 0) * item.quantity, 0)
    : 0

  async function handleSubmit() {
    if (!selected) return
    if (selected.items.some(item => !prices[item.id])) {
      addToast('Ingresa precio para todos los ítems', 'error')
      return
    }
    setSaving(true)
    try {
      const quoteItems: CreateQuoteItemReq[] = selected.items.map(item => ({
        rfqItemId:     item.id,
        confirmedSpec: item.spec,
        unitPrice:     prices[item.id] ?? 0,
        currency,
        leadTimeDays:  leadTime,
      }))
      await createQuote(selected.id, { items: quoteItems })
      addToast('Cotización enviada exitosamente', 'success')
      navigate('/seller')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error al enviar cotización', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SellerLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Responder Cotizaciones</h1>
          <p className="page-subtitle">Selecciona una solicitud y envía tu oferta</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* RFQ list */}
        <div className="card">
          <div className="card-header" style={{ padding: '14px 18px' }}>
            <div className="card-title" style={{ fontSize: 13 }}>
              <span className="mat-icon" style={{ fontSize: 16 }}>inbox</span>
              Solicitudes pendientes
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, background: 'var(--accent)', color: '#fff', padding: '1px 6px', borderRadius: 20 }}>
                {rfqs.length}
              </span>
            </div>
          </div>

          {loadingRfqs ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
              Cargando...
            </div>
          ) : rfqs.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Sin solicitudes activas
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {rfqs.map(rfq => {
                const isSelected = selected?.id === rfq.id
                return (
                  <div
                    key={rfq.id}
                    onClick={() => selectRFQ(rfq)}
                    style={{
                      padding: '12px 18px', cursor: 'pointer',
                      background: isSelected ? 'var(--primary-light)' : undefined,
                      borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                      borderBottom: '1px solid var(--border)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--primary)' : 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
                      {rfq.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {rfq.items.length} ítem{rfq.items.length !== 1 ? 's' : ''} · {rfq.categoryKey.replace(/_/g, ' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quote form */}
        <div>
          {!selected ? (
            <div className="card">
              <div className="empty-state" style={{ padding: '60px 24px' }}>
                <div className="empty-state-icon"><span className="mat-icon mat-icon-lg">edit_note</span></div>
                <div className="empty-state-title">Selecciona una solicitud</div>
                <div className="empty-state-desc">Elige una RFQ de la lista para comenzar tu cotización.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Pricing per item */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <span className="mat-icon" style={{ fontSize: 18 }}>payments</span>
                    Precios por ítem
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Moneda</label>
                    <select
                      className="form-select"
                      style={{ padding: '5px 10px', fontSize: 12, width: 'auto' }}
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Línea</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Especificación</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map(item => {
                        const price = prices[item.id] ?? 0
                        const sub = price * item.quantity
                        return (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{item.lineNumber}</td>
                            <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                            <td style={{ fontSize: 12 }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {Object.entries(item.spec).slice(0, 3).map(([k, v]) => (
                                  <span key={k} style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11 }}>
                                    {k}: {String(v)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="form-input"
                                style={{ width: 130, padding: '6px 10px', fontSize: 13 }}
                                value={price || ''}
                                placeholder="0"
                                onChange={e => setPrices(p => ({ ...p, [item.id]: parseFloat(e.target.value) || 0 }))}
                              />
                            </td>
                            <td style={{ fontWeight: 700, color: sub > 0 ? 'var(--success)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                              {sub > 0 ? (currency === 'CLP' ? formatCLP(sub) : `${sub.toLocaleString('es-CL')} ${currency}`) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Volume discounts (UI only) */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <span className="mat-icon" style={{ fontSize: 18 }}>discount</span>
                    Descuentos por volumen
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>(opcional)</span>
                  </div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Cantidad mín.</th>
                        <th>Descuento %</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map(tier => (
                        <tr key={tier}>
                          <td><input type="number" className="form-input" style={{ width: 100, padding: '5px 8px', fontSize: 12 }} placeholder={`≥ ${tier * 100}`} /></td>
                          <td><input type="number" className="form-input" style={{ width: 80, padding: '5px 8px', fontSize: 12 }} placeholder={`${tier * 2}%`} /></td>
                          <td><input className="form-input" style={{ padding: '5px 8px', fontSize: 12 }} placeholder="Nivel básico, medio, alto..." /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logistics */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <span className="mat-icon" style={{ fontSize: 18 }}>local_shipping</span>
                    Logística y condiciones
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Lead time (días) <span className="required">*</span></label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={leadTime}
                        onChange={e => setLeadTime(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Incoterms <span className="required">*</span></label>
                      <select className="form-select" value={incoterms} onChange={e => setIncoterms(e.target.value)}>
                        {INCOTERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Origen del despacho</label>
                      <input
                        className="form-input"
                        placeholder="Ciudad, País"
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Validez hasta</label>
                      <input
                        type="date"
                        className="form-input"
                        value={validUntil}
                        onChange={e => setValidUntil(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adjuntar ficha técnica</label>
                    <div style={{
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                      padding: '20px', textAlign: 'center', background: 'var(--bg)', cursor: 'pointer',
                    }}>
                      <span className="mat-icon" style={{ fontSize: 28, color: 'var(--text-light)', display: 'block', marginBottom: 8 }}>upload_file</span>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Arrastra o haz click para subir documentos técnicos
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>PDF, DOCX (máx. 10 MB)</div>
                      <input type="file" style={{ display: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary + submit */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Summary card */}
                <div className="card" style={{ flex: 1, padding: '20px 24px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Resumen de oferta</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total estimado</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {currency === 'CLP' ? formatCLP(totalEstimate) : `${totalEstimate.toLocaleString('es-CL')} ${currency}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Incoterms</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{incoterms}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lead time</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{leadTime} días</span>
                  </div>
                </div>

                <button
                  className="btn btn-success"
                  style={{ alignSelf: 'flex-end', padding: '12px 28px' }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <span className="mat-icon" style={{ fontSize: 18 }}>send</span>
                  {saving ? 'Enviando...' : 'Enviar cotización'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  )
}
