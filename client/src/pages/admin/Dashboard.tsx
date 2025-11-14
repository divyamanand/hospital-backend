import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { query } from '@/lib/api'
import { useQueries } from '@tanstack/react-query'

export default function AdminDashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['patients','count'], queryFn: () => query<any[]>('/patients') },
      { queryKey: ['staff','count'], queryFn: () => query<any[]>('/staff') },
      { queryKey: ['appointments','count'], queryFn: () => query<any[]>('/appointments?limit=1') },
      { queryKey: ['inventory','lowStock'], queryFn: () => query<any[]>('/inventory?lowStock=true') },
    ]
  })
  const [p, s, a, i] = results.map(r => r.data || [])
  const stats = { patients: p.length, staff: s.length, appts: a.length, lowStock: i.length }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Stat title="Total Patients" value={stats.patients} />
      <Stat title="Total Staff" value={stats.staff} />
      <Stat title="Appointments" value={stats.appts} />
      <Stat title="Low Stock Items" value={stats.lowStock} />
    </div>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-semibold">{value}</div></CardContent>
    </Card>
  )
}
