export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'green' | 'blue' | 'red' | 'gray' }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700'
  }
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${colors[color]}`}>{children}</span>
}
