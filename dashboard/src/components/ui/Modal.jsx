import { useEffect } from 'react'
import Button from './Button'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className={`bg-white rounded-[16px] shadow-xl w-full ${widths[size]} flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e5ec]">
          <h2 className="text-lg font-display font-bold text-[#111827]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6b7280] hover:bg-[#f1f3f7] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e2e5ec]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
