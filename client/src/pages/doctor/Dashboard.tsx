import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { query } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export default function DoctorDashboard() {
  const { data: appts = [] } = useQuery({ queryKey: ['appointments','doctor'], queryFn: () => query<any[]>('/appointments') })
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Today's Appointments</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {appts.slice(0, 8).map(a => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{a?.time || a.id}</span>
                <span className="text-gray-500">{a?.patient?.name || a.patient_id}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>My Patients</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-500">Recent patients from prescriptions and appointments</CardContent>
      </Card>
    </div>
  )
}
