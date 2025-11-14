export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}
export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
      <tr>{children}</tr>
    </thead>
  )
}
export function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2">{children}</th>
}
export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}
export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-gray-50/60">{children}</tr>
}
export function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2">{children}</td>
}
