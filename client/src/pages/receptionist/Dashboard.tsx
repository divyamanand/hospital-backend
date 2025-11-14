import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { query } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export default function ReceptionistDashboard() {
  const { data: today = [] } = useQuery({ queryKey: ['appointments','today'], queryFn: () => query<any[]>('/appointments') })
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Today's Appointments</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {today.slice(0, 8).map(a => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{a?.patient?.name || a.patient_id}</span>
                <span className="text-gray-500">{a?.doctor?.name || a.doctor_id}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <a href="/receptionist/patients" className="rounded-md border p-3 hover:bg-gray-50">Add Patient</a>
          <a href="/receptionist/appointments" className="rounded-md border p-3 hover:bg-gray-50">Book Appointment</a>
        </CardContent>
      </Card>
    </div>
  )
}
