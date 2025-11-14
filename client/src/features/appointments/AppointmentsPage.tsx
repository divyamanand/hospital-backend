import { useQuery } from '@tanstack/react-query'
import { query } from '@/lib/api'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AppointmentsPage() {
  const { data: rows = [] } = useQuery({ queryKey: ['appointments'], queryFn: () => query<any[]>('/appointments') })
  const statusColor = (s?: string) => s === 'confirmed' ? 'blue' : s === 'completed' ? 'green' : s === 'cancelled' ? 'red' : 'gray'
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Appointments</h1>
      <Table>
        <THead>
          <Th>Patient</Th>
          <Th>Doctor</Th>
          <Th>Date</Th>
          <Th>Status</Th>
        </THead>
        <TBody>
          {rows.map(a => (
            <Tr key={a.id}>
              <Td>{a?.patient?.name || a.patient_id}</Td>
              <Td>{a?.doctor?.name || a.doctor_id}</Td>
              <Td>{a?.scheduled_at || a.time || '-'}</Td>
              <Td><Badge color={statusColor(a?.status)}>{a?.status || 'scheduled'}</Badge></Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
