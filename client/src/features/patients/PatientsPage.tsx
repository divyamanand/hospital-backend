import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { query, mutate } from '@/lib/api'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import PatientForm, { type Patient } from './PatientForm'

export default function PatientsPage() {
  const qc = useQueryClient()
  const { data: rows = [] } = useQuery({ queryKey: ['patients'], queryFn: () => query<any[]>('/patients') })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | undefined>(undefined)

  const createMut = useMutation({
    mutationFn: (data: Patient) => mutate('/patients', data, 'POST'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); setOpen(false); setEditing(undefined) }
  })
  const updateMut = useMutation({
    mutationFn: (data: Patient) => mutate(`/patients/${data.id}`, data, 'PUT'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); setOpen(false); setEditing(undefined) }
  })

  const onSubmit = (data: Patient) => {
    if (editing?.id) updateMut.mutate({ ...data, id: editing.id })
    else createMut.mutate(data)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Patients</h1>
        <Button onClick={() => { setEditing(undefined); setOpen(true) }}>Add Patient</Button>
      </div>
      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Age</Th>
          <Th>Phone</Th>
          <Th></Th>
        </THead>
        <TBody>
          {rows.map(p => (
            <Tr key={p.id}>
              <Td>{p.name || p.full_name || p.id}</Td>
              <Td>{p.age || '-'}</Td>
              <Td>{p.phone || '-'}</Td>
              <Td>
                <Button variant="outline" size="sm" onClick={() => { setEditing(p); setOpen(true) }}>Edit</Button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader title={editing ? 'Edit Patient' : 'Add Patient'} />
        <DialogBody>
          <PatientForm initial={editing} onSubmit={onSubmit} submitting={createMut.isPending || updateMut.isPending} />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={createMut.isPending || updateMut.isPending}>Cancel</Button>
          <Button onClick={() => (document.querySelector('form') as HTMLFormElement)?.requestSubmit()} disabled={createMut.isPending || updateMut.isPending}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
