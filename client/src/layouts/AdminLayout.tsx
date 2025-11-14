import { Outlet, Route, Routes, Navigate } from 'react-router-dom'
import Sidebar, { icons } from './_Sidebar'
import AdminDashboard from '@/pages/admin/Dashboard'
import UsersPage from '@/pages/admin/UsersPage'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import InventoryPage from '@/features/inventory/InventoryPage'
import RoomsPage from '@/features/rooms/RoomsPage'
import RequirementsPage from '@/features/requirements/RequirementsPage'

const items = [
  { to: '/admin', label: 'Dashboard', icon: icons.Gauge },
  { to: '/admin/users', label: 'Users', icon: icons.Users },
  { to: '/admin/appointments', label: 'Appointments', icon: icons.Calendar },
  { to: '/admin/inventory', label: 'Inventory', icon: icons.Box },
  { to: '/admin/rooms', label: 'Rooms', icon: icons.Bed },
  { to: '/admin/requirements', label: 'Requirements', icon: icons.ClipboardList }
]

export default function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar items={items} />
      <main className="container mx-auto flex-1 space-y-6 p-6">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  )
}
