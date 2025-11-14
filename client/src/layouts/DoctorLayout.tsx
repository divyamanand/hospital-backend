import { Outlet, Route, Routes, Navigate } from 'react-router-dom'
import Sidebar, { icons } from './_Sidebar'
import DoctorDashboard from '@/pages/doctor/Dashboard'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import PatientsPage from '@/features/patients/PatientsPage'
import PrescriptionsPage from '@/features/prescriptions/PrescriptionsPage'

const items = [
  { to: '/doctor', label: 'Dashboard', icon: icons.Gauge },
  { to: '/doctor/appointments', label: 'Appointments', icon: icons.Calendar },
  { to: '/doctor/patients', label: 'My Patients', icon: icons.Users },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: icons.ClipboardList }
]

export default function DoctorLayout() {
  return (
    <div className="flex">
      <Sidebar items={items} />
      <main className="container mx-auto flex-1 space-y-6 p-6">
        <Routes>
          <Route path="/" element={<DoctorDashboard />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="*" element={<Navigate to="/doctor" replace />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  )
}
