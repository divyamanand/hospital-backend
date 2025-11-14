import { NavLink } from 'react-router-dom'
import { Calendar, Users, Stethoscope, Box, Bed, ClipboardList, Settings, UserPlus2, Gauge } from 'lucide-react'

type Item = { to: string; label: string; icon: any }

export default function Sidebar({ items }: { items: Item[] }) {
  return (
    <aside className="h-screen w-64 shrink-0 border-r bg-white">
      <div className="flex items-center gap-2 p-4 text-primary">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-white">+
        </span>
        <div className="font-semibold">Hospital Management</div>
      </div>
      <nav className="space-y-1 p-2">
        {items.map(it => (
          <NavLink key={it.to} to={it.to} className={({ isActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`
          }>
            <it.icon size={18} /> {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export const icons = { Calendar, Users, Stethoscope, Box, Bed, ClipboardList, Settings, UserPlus2, Gauge }
