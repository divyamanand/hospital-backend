import { query } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export default function PatientDashboard() {
  const { data: appts = [] } = useQuery({ queryKey: ['appointments','patient'], queryFn: () => query<any[]>('/appointments') })
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
      <ul className="space-y-2">
        {appts.map(a => (<li key={a.id} className="rounded-md border bg-white p-3 text-sm">{a.time || a.id}</li>))}
      </ul>
    </div>
  )
}
