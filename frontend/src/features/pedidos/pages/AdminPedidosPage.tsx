import { useCallback, useMemo, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { usePedidos,useCambiarEstadoPedido } from '../hooks/usePedidos'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoError, EstadoVacio, Paginacion } from '../../../shared/components/Feedback'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { handleApiError } from '../../../shared/api/handleApiError'
import { dinero } from '../../productos/components/ProductoCard'
import type { EstadoPedido, Pedido } from '../types'

const cambios: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}
const estados: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

const pedidosVacios: Pedido[] = []

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [abierto, setAbierto] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(0)
  const pedidos = usePedidos(estado, pagina)
  const cambio = useCambiarEstadoPedido()
  const detalle = pedidos.data?.items.find(p => p.id === abierto)

  const { mutateAsync, isPending: actualizando } = cambio
  const cantidadPagina = pedidos.data?.items.length
  const actualizar = useCallback(async (id: number, nuevo: EstadoPedido) => {
    if (nuevo === 'CANCELADO' && !window.confirm('¿Cancelar este pedido y restituir su stock?')) return
    try {
      setError('')
      await mutateAsync({ id, estado: nuevo })
      if (estado && estado !== nuevo && cantidadPagina === 1 && pagina > 0) {
        setPagina(pagina - 1)
      }
    } catch (e) { setError(handleApiError(e)) }
  }, [mutateAsync, estado, cantidadPagina, pagina])

  const columnas = useMemo<ColumnDef<Pedido, unknown>[]>(() => [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: 'usuario_id', header: 'Usuario', cell: ({ row }) => `#${row.original.usuario_id}` },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => dinero(row.original.total) },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado}/> },
    {
      id: 'acciones', header: 'Acciones', cell: ({ row }) => {
        const p = row.original
        return <div className="flex flex-wrap gap-2">
          <Button variant="outline" aria-expanded={abierto === p.id} onClick={() => setAbierto(anterior => anterior === p.id ? null : p.id)}>{abierto === p.id ? 'Ocultar' : 'Detalle'}</Button>
          {cambios[p.estado].map(nuevo => <Button key={nuevo} variant={nuevo === 'CANCELADO' ? 'danger' : 'primary'} disabled={actualizando} onClick={() => void actualizar(p.id, nuevo)}>{nuevo === 'CANCELADO' ? 'Cancelar' : nuevo === 'ENTREGADO' ? 'Entregar' : 'Preparar'}</Button>)}
        </div>
      },
    },
  ], [abierto, actualizando, actualizar])

  // La API pagina y filtra; TanStack Table representa los resultados de la página actual.
  const table = useReactTable({
    data: pedidos.data?.items ?? pedidosVacios,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getRowId: pedido => String(pedido.id),
    manualPagination: true,
    rowCount: pedidos.data?.total ?? 0,
    state: { pagination: { pageIndex: pagina, pageSize: 10 } },
  })

  return <>
    <h1 className="titulo-seccion mb-6">Gestión de pedidos</h1>
    <label className="mb-5 block max-w-sm">
      <span className="etiqueta">Filtrar estado</span>
      <select className="campo" value={estado} onChange={e => { setEstado(e.target.value as EstadoPedido | ''); setPagina(0); setAbierto(null) }}>
        <option value="">Todos</option>
        {estados.map(x => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}
      </select>
    </label>
    {error && <EstadoError mensaje={error}/>}
    {pedidos.isPending ? <p>Cargando pedidos…</p> : pedidos.isError ? <EstadoError mensaje={handleApiError(pedidos.error)}/> : pedidos.data.items.length === 0 ? <EstadoVacio mensaje="No hay pedidos con ese estado."/> : <Card>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#edf3ed] text-[#355347]">
            {table.getHeaderGroups().map(grupo => <tr key={grupo.id}>
              {grupo.headers.map(h => <th scope="col" key={h.id} className="p-3 font-semibold">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>)}
            </tr>)}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(fila => <tr key={fila.id} className="border-b border-[#e8ece8]">
              {fila.getVisibleCells().map(c => <td key={c.id} className={c.column.id === 'id' ? 'p-3 font-semibold' : c.column.id === 'total' ? 'p-3 whitespace-nowrap' : 'p-3'}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
      {detalle && <PedidoDetalle pedido={detalle}/>}
    </Card>}
    {pedidos.data && <Paginacion pagina={pagina} total={pedidos.data.total} limite={10} setPagina={p => { setPagina(p); setAbierto(null) }}/>}
  </>
}
