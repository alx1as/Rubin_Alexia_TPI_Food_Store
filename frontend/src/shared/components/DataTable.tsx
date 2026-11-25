import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui/Button'

export function DataTable<T,>({ datos, columnas }: { datos: T[]; columnas: ColumnDef<T, unknown>[] }) {
  const table = useReactTable({ data: datos, columns: columnas, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageIndex: 0, pageSize: 10 } } })
  if (datos.length === 0) return <p className="py-8 text-center text-sm text-[#617468]">No hay registros para mostrar.</p>
  return <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead className="bg-[#edf3ed] text-[#355347]">{table.getHeaderGroups().map((g)=><tr key={g.id}>{g.headers.map((h)=><th className="p-3 font-semibold" key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header,h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((r)=><tr key={r.id} className="border-b border-[#e8ece8]">{r.getVisibleCells().map((c)=><td className="p-3" key={c.id}>{flexRender(c.column.columnDef.cell,c.getContext())}</td>)}</tr>)}</tbody></table><div className="flex items-center justify-between pt-4 text-sm text-[#617468]"><span>Página {table.getState().pagination.pageIndex+1} de {Math.max(1, table.getPageCount())}</span><div className="flex gap-2"><Button variant="outline" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button><Button variant="outline" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button></div></div></div>
}
