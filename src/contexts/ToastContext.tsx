import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const TOAST_ICONS: Record<ToastType, ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'var(--success-bg)', border: 'var(--success)', color: '#065F46' },
  error:   { bg: 'var(--danger-bg)',  border: 'var(--danger)',  color: '#991B1B' },
  info:    { bg: 'var(--info-bg)',    border: 'var(--info)',    color: '#1E40AF' },
}

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }].slice(-4))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container — bottom-right */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        width: 360,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const s = TOAST_STYLES[t.type]
          return (
            <div key={t.id} className="toast-item" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderLeft: `4px solid ${s.border}`,
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              color: s.color,
              fontSize: 14,
              fontWeight: 500,
              pointerEvents: 'all',
            }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{TOAST_ICONS[t.type]}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: s.color, opacity: 0.55, padding: 2, flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <IconClose />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
