import { useQuery } from '@tanstack/react-query'
import { query } from '@/lib/api'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/table'

export default function StaffPage() {
  const { data: rows = [] } = useQuery({ queryKey: ['staff'], queryFn: () => query<any[]>('/staff') })
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Staff</h1>
      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Role</Th>
          <Th>Phone</Th>
        </THead>
        <TBody>
          {rows.map(s => (
            <Tr key={s.id}>
              <Td>{s.name || s.full_name || s.id}</Td>
              <Td>{s.role}</Td>
              <Td>{s.phone || '-'}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
