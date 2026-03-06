import type { RFQ, Quote } from '../types/dto'

interface Props {
  rfq: RFQ
  quotes: Quote[]
  supplierNames: Record<string, string>
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

function fmtPrice(amount: number, currency: string) {
  return currency === 'CLP' ? formatCLP(amount) : `${amount.toLocaleString('es-CL')} ${currency}`
}

/* ── Utils ───────────────────────────────────────────── */
function specDiffers(req: Record<string, unknown>, confirmed: Record<string, unknown>): boolean {
  return Object.keys(req).some(k => String(req[k]) !== String(confirmed[k]))
}

function diffKeys(req: Record<string, unknown>, confirmed: Record<string, unknown>): string[] {
  return Object.keys(req).filter(k => String(req[k]) !== String(confirmed[k]))
}

export default function RFQCompareTable({ rfq, quotes, supplierNames }: Props) {
  if (quotes.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>No hay cotizaciones para comparar.</p>
  }

  const totals = quotes.map(q =>
    rfq.items.reduce((sum, item) => {
      const qi = q.items.find(qi => qi.rfqItemId === item.id)
      return sum + (qi ? qi.unitPrice * item.quantity : 0)
    }, 0)
  )
  const minTotal   = Math.min(...totals)
  const winnerIdx  = totals.indexOf(minTotal)

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, flexWrap: 'wrap', background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#D97706', fontWeight: 600 }}>
          <span className="mat-icon mat-icon-filled" style={{ fontSize: 14, color: '#D97706' }}>emoji_events</span>
          Mejor precio total
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--success)', fontWeight: 600 }}>
          <span className="mat-icon mat-icon-filled" style={{ fontSize: 14 }}>check_circle</span>
          Spec conforme
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--warning)', fontWeight: 600 }}>
          <span className="mat-icon" style={{ fontSize: 14 }}>warning</span>
          Spec modificada
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{
              background: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              padding: '12px 16px', textAlign: 'left',
              position: 'sticky', left: 0, zIndex: 1,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              borderBottom: '2px solid var(--border)',
            }}>
              Ítem / Especificación
            </th>
            {quotes.map((q, qi) => {
              const isWinner = qi === winnerIdx
              return (
                <th key={q.id} style={{
                  background: isWinner ? '#F0FDF4' : 'var(--bg-subtle)',
                  padding: '12px 16px', textAlign: 'center', minWidth: 200,
                  borderLeft: `1px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                  borderBottom: `2px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isWinner ? '#059669' : 'var(--primary)', marginBottom: 4 }}>
                    Proveedor
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isWinner ? '#065F46' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    {isWinner && <span className="mat-icon mat-icon-filled" style={{ fontSize: 14, color: '#D97706' }}>emoji_events</span>}
                    {supplierNames[q.supplierCompanyId] ?? q.supplierCompanyId}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginTop: 3 }}>
                    {new Date(q.createdAt).toLocaleDateString('es-CL')}
                  </div>
                  {isWinner && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      marginTop: 6, background: '#D1FAE5',
                      border: '1px solid #34D399', borderRadius: 20,
                      padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#065F46',
                    }}>
                      MEJOR PRECIO
                    </div>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rfq.items.map((item, itemIdx) => {
            const quoteItems = quotes.map(q => q.items.find(qi => qi.rfqItemId === item.id))
            const prices   = quoteItems.map(qi => qi?.unitPrice ?? Infinity).filter(p => isFinite(p))
            const minPrice = prices.length > 0 ? Math.min(...prices) : Infinity

            return (
              <>
                {/* Item header row */}
                <tr key={`header-${item.id}`} style={{ background: 'var(--bg-subtle)' }}>
                  <td style={{
                    padding: '10px 16px', fontWeight: 700, color: 'var(--primary)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky', left: 0, background: 'var(--bg-subtle)', zIndex: 1,
                  }}>
                    Línea {item.lineNumber} — {item.quantity} {item.unit}
                  </td>
                  {quotes.map((q, qi) => {
                    const quoteItem = quoteItems[qi]
                    const isWinner  = qi === winnerIdx
                    if (!quoteItem) {
                      return (
                        <td key={q.id} style={{
                          padding: '10px 16px', textAlign: 'center',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-light)',
                          borderLeft: `1px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                        }}>
                          Sin cotizar
                        </td>
                      )
                    }
                    const differs = specDiffers(item.spec, quoteItem.confirmedSpec)
                    const diffed  = differs ? diffKeys(item.spec, quoteItem.confirmedSpec) : []
                    const isMin   = quoteItem.unitPrice === minPrice

                    return (
                      <td key={q.id} style={{
                        padding: '10px 16px', textAlign: 'center',
                        borderBottom: '1px solid var(--border)',
                        background: isWinner ? '#F0FDF4' : 'transparent',
                        borderLeft: `1px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                      }}>
                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                          {isMin && <span className="mat-icon mat-icon-filled" style={{ fontSize: 14, color: '#D97706' }}>star</span>}
                          <span style={{ fontSize: 16, fontWeight: 800, color: isMin ? 'var(--success)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                            {fmtPrice(quoteItem.unitPrice, quoteItem.currency)}
                          </span>
                        </div>
                        {/* Subtotal */}
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, fontVariantNumeric: 'tabular-nums' }}>
                          Subtotal: {fmtPrice(quoteItem.unitPrice * item.quantity, quoteItem.currency)}
                        </div>
                        {/* Lead time */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                          <span className="mat-icon" style={{ fontSize: 13 }}>schedule</span>
                          {quoteItem.leadTimeDays} días
                        </div>
                        {/* Spec badge */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: differs ? 'var(--warning-bg)' : 'var(--success-bg)',
                          color: differs ? 'var(--warning)' : 'var(--success)',
                        }}>
                          {differs
                            ? <><span className="mat-icon" style={{ fontSize: 12 }}>warning</span> {diffed.length} cambio{diffed.length > 1 ? 's' : ''}</>
                            : <><span className="mat-icon mat-icon-filled" style={{ fontSize: 12 }}>check_circle</span> Spec conforme</>
                          }
                        </div>
                        {/* Changed spec details */}
                        {differs && (
                          <div style={{ marginTop: 6 }}>
                            {diffed.map(k => (
                              <div key={k} style={{ fontSize: 11, color: 'var(--warning)' }}>
                                {k}: <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{String(item.spec[k])}</span>
                                {' → '}
                                <strong>{String(quoteItem.confirmedSpec[k])}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>

                {/* Spec row */}
                <tr key={`spec-${item.id}`} style={{ background: itemIdx % 2 === 0 ? '#FAFBFD' : '#fff' }}>
                  <td style={{ padding: '8px 16px 14px', borderBottom: '2px solid var(--border)', position: 'sticky', left: 0, background: 'inherit', zIndex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Spec requerida
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {Object.entries(item.spec).map(([k, v]) => (
                        <span key={k} style={{ padding: '2px 7px', borderRadius: 5, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11 }}>
                          {k}: <strong>{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  {quotes.map((q, qi) => {
                    const quoteItem = quoteItems[qi]
                    const isWinner  = qi === winnerIdx
                    if (!quoteItem) return (
                      <td key={q.id} style={{
                        borderBottom: '2px solid var(--border)',
                        borderLeft: `1px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                      }} />
                    )
                    return (
                      <td key={q.id} style={{
                        padding: '8px 16px 14px', borderBottom: '2px solid var(--border)',
                        verticalAlign: 'top',
                        background: isWinner ? '#F0FDF4' : 'transparent',
                        borderLeft: `1px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
                          Spec ofertada
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {Object.entries(quoteItem.confirmedSpec).map(([k, v]) => {
                            const diff = String(item.spec[k]) !== String(v)
                            return (
                              <span key={k} style={{
                                padding: '2px 7px', borderRadius: 5, fontSize: 11,
                                background: diff ? 'var(--warning-bg)' : 'var(--success-bg)',
                                border: `1px solid ${diff ? '#FDE68A' : '#6EE7B7'}`,
                                color: diff ? 'var(--warning)' : 'var(--success)',
                                fontWeight: diff ? 700 : 500,
                              }}>
                                {k}: <strong>{String(v)}</strong>
                              </span>
                            )
                          })}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              </>
            )
          })}
        </tbody>

        {/* Summary / totals row */}
        <tfoot>
          <tr style={{ background: 'var(--primary-light)' }}>
            <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)', position: 'sticky', left: 0, background: 'var(--primary-light)', fontSize: 13 }}>
              Total estimado
            </td>
            {quotes.map((q, qi) => {
              const total    = totals[qi]
              const currency = q.items[0]?.currency ?? ''
              const isWinner = qi === winnerIdx

              return (
                <td key={q.id} style={{
                  padding: '14px 16px', textAlign: 'center',
                  fontWeight: 800, fontSize: 16,
                  color: isWinner ? 'var(--success)' : 'var(--text)',
                  fontVariantNumeric: 'tabular-nums',
                  background: isWinner ? '#DCFCE7' : 'var(--primary-light)',
                  borderLeft: `1px solid ${isWinner ? '#34D399' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {isWinner && <span className="mat-icon mat-icon-filled" style={{ fontSize: 16, color: '#D97706' }}>emoji_events</span>}
                    {fmtPrice(total, currency)}
                  </div>
                  {isWinner && (
                    <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500, marginTop: 3 }}>
                      Mejor oferta total
                    </div>
                  )}
                </td>
              )
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
