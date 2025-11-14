import { Outlet, Route, Routes, Navigate } from 'react-router-dom'
import Sidebar, { icons } from './_Sidebar'
import RoomManagerDashboard from '@/pages/roomManager/Dashboard'
import RoomsPage from '@/features/rooms/RoomsPage'

const items = [
  { to: '/roomManager', label: 'Dashboard', icon: icons.Gauge },
  { to: '/roomManager/rooms', label: 'Rooms', icon: icons.Bed }
]

export default function RoomManagerLayout() {
  return (
    <div className="flex">
      <Sidebar items={items} />
      <main className="container mx-auto flex-1 space-y-6 p-6">
        <Routes>
          <Route path="/" element={<RoomManagerDashboard />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="*" element={<Navigate to="/roomManager" replace />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  )
}
