import { Outlet, Route, Routes, Navigate } from 'react-router-dom'
import Sidebar, { icons } from './_Sidebar'
import InventoryDashboard from '@/pages/inventory/Dashboard'
import InventoryPage from '@/features/inventory/InventoryPage'
import PrescriptionsPage from '@/features/prescriptions/PrescriptionsPage'

const items = [
  { to: '/inventory', label: 'Dashboard', icon: icons.Gauge },
  { to: '/inventory/items', label: 'Inventory', icon: icons.Box },
  { to: '/inventory/prescriptions', label: 'Prescriptions', icon: icons.ClipboardList }
]

export default function InventoryLayout() {
  return (
    <div className="flex">
      <Sidebar items={items} />
      <main className="container mx-auto flex-1 space-y-6 p-6">
        <Routes>
          <Route path="/" element={<InventoryDashboard />} />
          <Route path="/items" element={<InventoryPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  )
}
