import { useQuery } from '@tanstack/react-query'
import { query } from '@/lib/api'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/table'

export default function RequirementsPage() {
  const { data: rows = [] } = useQuery({
    queryKey: ['requirements', 'recent'],
    queryFn: async () => {
      const appts = await query<any[]>('/appointments')
      const take = appts.slice(0, 10)
      const lists = await Promise.all(take.map((a) => query<any[]>(`/requirements/${a.id}` as any).catch(() => [])))
      return lists.flat()
    }
  })
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Requirements</h1>
      <Table>
        <THead>
          <Th>Appointment</Th>
          <Th>Type</Th>
          <Th>Status</Th>
        </THead>
        <TBody>
          {rows.map(r => (
            <Tr key={r.id}>
              <Td>{r.appointment_id}</Td>
              <Td>{r.type}</Td>
              <Td>{r.status}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
