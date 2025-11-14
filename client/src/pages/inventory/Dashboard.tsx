import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { query } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export default function InventoryDashboard() {
  const { data: low = [] } = useQuery({ queryKey: ['inventory','lowStock'], queryFn: () => query<any[]>('/inventory?lowStock=true') })
  return (
    <Card>
      <CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {low.map(i => (<li key={i.id} className="flex justify-between"><span>{i.name}</span><span className="text-gray-500">{i.quantity}</span></li>))}
        </ul>
      </CardContent>
    </Card>
  )
}
