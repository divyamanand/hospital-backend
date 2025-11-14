import { useQuery } from '@tanstack/react-query'
import { query } from '@/lib/api'

export default function RoomsPage() {
  const { data: rows = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => query<any[]>('/rooms') })
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Rooms</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {rows.map(r => (
          <div key={r.id} className="rounded-lg border bg-white p-4">
            <div className="font-medium">{r.name || r.number || r.id}</div>
            <div className="text-sm text-gray-500">{r.status || 'available'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
