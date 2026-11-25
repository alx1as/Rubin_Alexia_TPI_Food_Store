import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { dinero } from '../../productos/components/ProductoCard'
import type { Pedido } from '../types'

export function PedidoDetalle({pedido}: {pedido: Pedido}) {
  return <div className="mt-4 rounded-xl bg-[#f1f6ef] p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>Pedido #{pedido.id}</strong><BadgeEstado estado={pedido.estado}/></div><p className="mt-2 text-[#687b6a]">{new Date(pedido.created_at).toLocaleString('es-AR')} · {pedido.direccion_entrega} · {pedido.forma_pago}</p>{pedido.notas&&<p className="mt-1">Nota: {pedido.notas}</p>}<div className="my-3 space-y-1">{pedido.items.map((i,index)=><p key={index} className="flex justify-between"><span>{i.cantidad} × {i.nombre_producto} ({dinero(i.precio_unitario)})</span><span>{dinero(i.subtotal)}</span></p>)}</div><p className="border-t border-[#dae5d8] pt-2 text-right font-bold">Total: {dinero(pedido.total)}</p></div>
}
