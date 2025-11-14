import { useEffect, useState } from 'react'
import { query } from '@/lib/api'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/table'

export default function PrescriptionsPage() {
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => { query<any[]>('/prescriptions').then(setRows).catch(()=>{}) }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Prescriptions</h1>
      <Table>
        <THead>
          <Th>ID</Th>
          <Th>Patient</Th>
          <Th>Doctor</Th>
          <Th>Date</Th>
        </THead>
        <TBody>
          {rows.map(p => (
            <Tr key={p.id}>
              <Td>{p.id}</Td>
              <Td>{p?.patient?.name || p.patient_id}</Td>
              <Td>{p?.doctor?.name || p.doctor_id}</Td>
              <Td>{p?.created_at || '-'}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
