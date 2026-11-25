import type { EstadoPedido } from '../../features/pedidos/types'
export function BadgeEstado({estado}: {estado: EstadoPedido}) {
  const tonos = { PENDIENTE:'bg-amber-100 text-amber-800', EN_PREPARACION:'bg-blue-100 text-blue-800', ENTREGADO:'bg-emerald-100 text-emerald-800', CANCELADO:'bg-red-100 text-red-800' }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tonos[estado]}`}>{estado.replace('_',' ')}</span>
}
