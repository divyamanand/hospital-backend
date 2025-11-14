import { useQuery } from '@tanstack/react-query'
import { query } from '@/lib/api'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/table'

export default function InventoryPage() {
  const { data: rows = [] } = useQuery({ queryKey: ['inventory'], queryFn: () => query<any[]>('/inventory') })
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Inventory</h1>
      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Quantity</Th>
          <Th>Expiry</Th>
        </THead>
        <TBody>
          {rows.map(i => (
            <Tr key={i.id}>
              <Td>{i.name}</Td>
              <Td>{i.type}</Td>
              <Td>{i.quantity}</Td>
              <Td>{i.expiry || '-'}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
