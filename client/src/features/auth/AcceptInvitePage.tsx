import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AcceptInvitePage() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const nav = useNavigate()
  const qc = useQueryClient()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/auth/accept-invite', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      if (!res.ok) throw new Error(await res.text())
      await qc.invalidateQueries({ queryKey: ['me'] })
      nav('/')
    } catch (err: any) {
      setError(err.message || 'Failed')
    }
  }

  return (
    <div className="grid h-full place-items-center">
      <form onSubmit={handle} className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold">Accept Invitation</h1>
        <div className="space-y-2">
          <label className="text-sm font-medium">Set Password</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit">Continue</Button>
      </form>
    </div>
  )
}
