import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

export type Patient = {
  id?: string
  name?: string
  full_name?: string
  age?: number
  gender?: string
  phone?: string
  email?: string
}

export default function PatientForm({ initial, onSubmit, submitting }: { initial?: Patient; onSubmit: (data: Patient) => void; submitting?: boolean }) {
  const [form, setForm] = useState<Patient>({ name: '', age: undefined, gender: '', phone: '', email: '' })
  useEffect(() => {
    if (initial) setForm({
      id: initial.id,
      name: initial.name ?? initial.full_name ?? '',
      age: initial.age,
      gender: initial.gender ?? '',
      phone: initial.phone ?? '',
      email: initial.email ?? ''
    })
  }, [initial])

  const update = (k: keyof Patient) => (e: any) => setForm({ ...form, [k]: e.target.value })

  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form) }

  return (
    <form className="space-y-3" onSubmit={handle}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm">Name</label>
          <Input value={form.name || ''} onChange={update('name')} required />
        </div>
        <div>
          <label className="text-sm">Age</label>
          <Input type="number" value={form.age ?? ''} onChange={update('age')} />
        </div>
        <div>
          <label className="text-sm">Gender</label>
          <Input value={form.gender || ''} onChange={update('gender')} />
        </div>
        <div>
          <label className="text-sm">Phone</label>
          <Input value={form.phone || ''} onChange={update('phone')} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm">Email (optional)</label>
          <Input type="email" value={form.email || ''} onChange={update('email')} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-white disabled:opacity-50" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  )
}
