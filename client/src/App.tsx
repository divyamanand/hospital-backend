import { Route, Routes, Navigate } from 'react-router-dom'
import { useAuthBootstrap } from './hooks/useAuth'
import AdminLayout from './layouts/AdminLayout'
import ReceptionistLayout from './layouts/ReceptionistLayout'
import DoctorLayout from './layouts/DoctorLayout'
import InventoryLayout from './layouts/InventoryLayout'
import RoomManagerLayout from './layouts/RoomManagerLayout'
import PatientLayout from './layouts/PatientLayout'
import LoginPage from './features/auth/LoginPage'
import AcceptInvitePage from './features/auth/AcceptInvitePage'

export default function App() {
  const { user, loading } = useAuthBootstrap()
  if (loading) return <div className="grid h-full place-items-center">Loading…</div>

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      {user?.role === 'admin' && <Route path="/*" element={<AdminLayout />} />}
      {user?.role === 'receptionist' && <Route path="/*" element={<ReceptionistLayout />} />}
      {user?.role === 'doctor' && <Route path="/*" element={<DoctorLayout />} />}
      {user?.role === 'inventory' && <Route path="/*" element={<InventoryLayout />} />}
      {user?.role === 'room_manager' && <Route path="/*" element={<RoomManagerLayout />} />}
      {user?.role === 'patient' && <Route path="/*" element={<PatientLayout />} />}

      {!user && <Route path="*" element={<Navigate to="/login" replace />} />}
    </Routes>
  )
}
