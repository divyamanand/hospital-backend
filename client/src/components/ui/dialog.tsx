import React from 'react'

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-lg border bg-white shadow-lg">{children}</div>
      </div>
    </div>
  )
}

export function DialogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b p-4">
      <div className="text-lg font-semibold">{title}</div>
      {description && <div className="text-sm text-gray-500">{description}</div>}
    </div>
  )
}

export function DialogBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 border-t p-4">{children}</div>
}
