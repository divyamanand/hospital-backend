import { Outlet, Route, Routes, Navigate } from 'react-router-dom'
import Sidebar, { icons } from './_Sidebar'
import PatientDashboard from '@/pages/patient/Dashboard'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import PrescriptionsPage from '@/features/prescriptions/PrescriptionsPage'

const items = [
  { to: '/patient', label: 'Dashboard', icon: icons.Gauge },
  { to: '/patient/appointments', label: 'My Appointments', icon: icons.Calendar },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: icons.ClipboardList }
]

export default function PatientLayout() {
  return (
    <div className="flex">
      <Sidebar items={items} />
      <main className="container mx-auto flex-1 space-y-6 p-6">
        <Routes>
          <Route path="/" element={<PatientDashboard />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  )
}
