import { query } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export default function RoomManagerDashboard() {
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms','grid'], queryFn: () => query<any[]>('/rooms') })
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
      {rooms.map(r => (
        <div key={r.id} className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium">Room {r.number || r.name || r.id}</div>
          <div className="text-xs text-gray-500">{r.status || 'available'}</div>
        </div>
      ))}
    </div>
  )
}
