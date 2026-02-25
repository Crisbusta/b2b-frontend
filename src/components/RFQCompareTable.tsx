import type { RFQ, Quote } from '../types/dto'

interface Props {
  rfq: RFQ
  quotes: Quote[]
  supplierNames: Record<string, string>
}

/* ── Icons ──────────────────────────────────────────── */
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconAlertTriangle = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconCheckSmall = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

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

  return (
    <div style={{ overflowX: 'auto' }}>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--success)' }}>
          <IconCheckSmall /> Spec conforme
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--warning)' }}>
          <IconAlertTriangle /> Spec modificada
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-light)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-light)', display: 'inline-block' }} />
          Sin ítem
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ background: 'var(--primary)', color: '#fff', padding: '10px 14px', textAlign: 'left', position: 'sticky', left: 0, zIndex: 1 }}>
              Ítem / Spec
            </th>
            {quotes.map(q => (
              <th key={q.id} style={{ background: 'var(--primary)', color: '#fff', padding: '10px 14px', textAlign: 'center', minWidth: 180 }}>
                <div style={{ fontWeight: 700 }}>{supplierNames[q.supplierCompanyId] ?? q.supplierCompanyId}</div>
                <div style={{ fontSize: 11, color: '#93C5FD', fontWeight: 400, marginTop: 2 }}>
                  {new Date(q.createdAt).toLocaleDateString('es-CL')}
                </div>
              </th>
            ))}
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
                    padding: '10px 14px',
                    fontWeight: 700, color: 'var(--primary)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky', left: 0, background: 'var(--bg-subtle)', zIndex: 1,
                  }}>
                    Línea {item.lineNumber} — {item.quantity} {item.unit}
                  </td>
                  {quotes.map((q, qi) => {
                    const quoteItem = quoteItems[qi]
                    if (!quoteItem) {
                      return (
                        <td key={q.id} style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid var(--border)', color: 'var(--text-light)' }}>
                          Sin cotizar
                        </td>
                      )
                    }
                    const differs = specDiffers(item.spec, quoteItem.confirmedSpec)
                    const diffed  = differs ? diffKeys(item.spec, quoteItem.confirmedSpec) : []
                    const isMin   = quoteItem.unitPrice === minPrice

                    return (
                      <td key={q.id} style={{
                        padding: '10px 14px',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border)',
                        background: isMin ? '#F0FDF4' : 'transparent',
                      }}>
                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                          {isMin && <span title="Mejor precio" style={{ color: '#F59E0B' }}><IconStar /></span>}
                          <span style={{ fontSize: 16, fontWeight: 800, color: isMin ? 'var(--success)' : 'var(--text)', fontFeatureSettings: '"tnum"' }}>
                            {quoteItem.unitPrice.toLocaleString('es-CL')}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{quoteItem.currency}</span>
                        </div>
                        {/* Subtotal */}
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, fontFeatureSettings: '"tnum"' }}>
                          Total: {(quoteItem.unitPrice * item.quantity).toLocaleString('es-CL')} {quoteItem.currency}
                        </div>
                        {/* Lead time */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                          <IconClock /> {quoteItem.leadTimeDays} días
                        </div>
                        {/* Spec badge */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: differs ? 'var(--warning-bg)' : 'var(--success-bg)',
                          color: differs ? 'var(--warning)' : 'var(--success)',
                        }}>
                          {differs
                            ? <><IconAlertTriangle /> {diffed.length} cambio{diffed.length > 1 ? 's' : ''}</>
                            : <><IconCheckSmall /> Spec conforme</>
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
                  <td style={{ padding: '8px 14px 14px', borderBottom: '2px solid var(--border)', position: 'sticky', left: 0, background: 'inherit', zIndex: 1 }}>
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
                    if (!quoteItem) return <td key={q.id} style={{ borderBottom: '2px solid var(--border)' }} />
                    return (
                      <td key={q.id} style={{ padding: '8px 14px 14px', borderBottom: '2px solid var(--border)', verticalAlign: 'top' }}>
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

        {/* Summary row */}
        <tfoot>
          <tr style={{ background: 'var(--primary-light)' }}>
            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)', position: 'sticky', left: 0, background: 'var(--primary-light)' }}>
              Total estimado
            </td>
            {quotes.map(q => {
              const total = rfq.items.reduce((sum, item) => {
                const qi = q.items.find(qi => qi.rfqItemId === item.id)
                return sum + (qi ? qi.unitPrice * item.quantity : 0)
              }, 0)
              const currency  = q.items[0]?.currency ?? ''
              const allTotals = quotes.map(qq => rfq.items.reduce((s, item) => {
                const qi = qq.items.find(qi => qi.rfqItemId === item.id)
                return s + (qi ? qi.unitPrice * item.quantity : 0)
              }, 0))
              const isMinTotal = total === Math.min(...allTotals)

              return (
                <td key={q.id} style={{
                  padding: '12px 14px', textAlign: 'center',
                  fontWeight: 800, fontSize: 15,
                  color: isMinTotal ? 'var(--success)' : 'var(--text)',
                  fontFeatureSettings: '"tnum"',
                }}>
                  {isMinTotal && <span style={{ color: '#F59E0B', marginRight: 4 }}><IconStar /></span>}
                  {total.toLocaleString('es-CL')} {currency}
                </td>
              )
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
