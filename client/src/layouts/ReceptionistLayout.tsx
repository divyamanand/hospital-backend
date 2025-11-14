import { Outlet, Route, Routes, Navigate } from 'react-router-dom'
import Sidebar, { icons } from './_Sidebar'
import ReceptionistDashboard from '@/pages/receptionist/Dashboard'
import PatientsPage from '@/features/patients/PatientsPage'
import StaffPage from '@/features/staff/StaffPage'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import RequirementsPage from '@/features/requirements/RequirementsPage'

const items = [
  { to: '/receptionist', label: 'Dashboard', icon: icons.Gauge },
  { to: '/receptionist/patients', label: 'Patients', icon: icons.Users },
  { to: '/receptionist/staff', label: 'Staff', icon: icons.Stethoscope },
  { to: '/receptionist/appointments', label: 'Appointments', icon: icons.Calendar },
  { to: '/receptionist/requirements', label: 'Requirements', icon: icons.ClipboardList }
]

export default function ReceptionistLayout() {
  return (
    <div className="flex">
      <Sidebar items={items} />
      <main className="container mx-auto flex-1 space-y-6 p-6">
        <Routes>
          <Route path="/" element={<ReceptionistDashboard />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="*" element={<Navigate to="/receptionist" replace />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  )
}
