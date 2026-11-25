import { useState } from 'react'
import { usePedidos, useCancelarPedido } from '../hooks/usePedidos'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoError, EstadoVacio, Paginacion } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
import { dinero } from '../../productos/components/ProductoCard'
export function MisPedidosPage() {
  const [pagina,setPagina]=useState(0)
  const pedidos=usePedidos('', pagina)
  const cancelar=useCancelarPedido()
  const [abierto,setAbierto]=useState<number|null>(null)
  const [error,setError]=useState('')
  const onCancelar=async (id:number)=>{if(!window.confirm('¿Cancelar este pedido y devolver su stock?'))return;try{setError('');await cancelar.mutateAsync(id)}catch(e){setError(handleApiError(e))}}
  return <div className="mx-auto max-w-4xl"><h1 className="titulo-seccion mb-6">Mis pedidos</h1>{error&&<EstadoError mensaje={error}/>}<div className="space-y-4">{pedidos.isPending?<p>Cargando pedidos…</p>:pedidos.isError?<EstadoError mensaje={handleApiError(pedidos.error)}/>:pedidos.data.items.length===0?<EstadoVacio mensaje="Todavía no hiciste pedidos."/>:pedidos.data.items.map(p=><Card key={p.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>Pedido #{p.id}</strong><p className="text-sm text-[#6b7b6b]">{new Date(p.created_at).toLocaleDateString('es-AR')} · {dinero(p.total)}</p></div><BadgeEstado estado={p.estado}/><div className="flex gap-2"><Button variant="outline" onClick={()=>setAbierto(abierto===p.id?null:p.id)}>{abierto===p.id?'Ocultar':'Ver detalle'}</Button>{p.estado==='PENDIENTE'&&<Button variant="danger" disabled={cancelar.isPending} onClick={()=>void onCancelar(p.id)}>Cancelar</Button>}</div></div>{abierto===p.id&&<PedidoDetalle pedido={p}/>}</Card>)}</div>{pedidos.data && <Paginacion pagina={pagina} total={pedidos.data.total} limite={10} setPagina={setPagina}/>}</div>
}
