import { useEffect, useState } from 'react'
import { query } from '@/lib/api'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/table'

export default function UsersPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  useEffect(() => { query<any[]>('/staff').then(setStaff); query<any[]>('/patients').then(setPatients) }, [])
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Staff</h2>
      <Table>
        <THead>
          <Th>Name</Th><Th>Role</Th><Th>Phone</Th>
        </THead>
        <TBody>
          {staff.map(s => (<Tr key={s.id}><Td>{s.name || s.full_name || s.id}</Td><Td>{s.role}</Td><Td>{s.phone || '-'}</Td></Tr>))}
        </TBody>
      </Table>

      <h2 className="text-xl font-semibold">Patients</h2>
      <Table>
        <THead>
          <Th>Name</Th><Th>Age</Th><Th>Phone</Th>
        </THead>
        <TBody>
          {patients.map(p => (<Tr key={p.id}><Td>{p.name || p.full_name || p.id}</Td><Td>{p.age || '-'}</Td><Td>{p.phone || '-'}</Td></Tr>))}
        </TBody>
      </Table>
    </div>
  )
}
