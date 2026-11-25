import { Link } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { EstadoVacio } from '../../../shared/components/Feedback'
import { dinero } from '../../productos/components/ProductoCard'

export function CarritoPage() {
  const usuario = useAuthStore(s => s.usuario)
  const cargando = useAuthStore(s => s.cargando)
  const items = useCartStore((s)=>s.items)
  const quitar = useCartStore((s)=>s.quitar)
  const cambiarCantidad=useCartStore((s)=>s.cambiarCantidad)
  const total = useCartStore((s)=>s.total())
  return <div className="mx-auto max-w-4xl"><div className="mb-8"><h1 className="titulo-seccion">Tu carrito</h1><p className="text-[#6d7f70]">Revisá tu pedido antes de confirmar.</p></div>
    {items.length===0 ? <EstadoVacio mensaje="Tu carrito está vacío. Volvé al catálogo para elegir algo rico."/> : <div className="grid gap-5 md:grid-cols-[1fr_260px]"><Card><div className="space-y-5">{items.map(i=><div key={i.producto_id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ede7] pb-5"><div><h2 className="font-bold">{i.nombre}</h2><p className="text-sm text-[#7a897c]">{dinero(i.precio_unitario)} c/u</p><button className="text-xs text-red-700 underline" onClick={()=>quitar(i.producto_id)}>Quitar</button></div><div className="flex items-center gap-3"><input aria-label={`Cantidad de ${i.nombre}`} className="campo w-20" type="number" min={1} step={1} value={i.cantidad} onChange={e=>cambiarCantidad(i.producto_id,Number(e.target.value))}/><strong>{dinero(i.cantidad*i.precio_unitario)}</strong></div></div>)}</div></Card><Card className="h-fit"><p className="text-sm text-[#7b8a7b]">Total estimado</p><strong className="my-3 block text-3xl">{dinero(total)}</strong><p className="mb-6 text-xs text-[#7a8a7e]">Los precios y el stock se verifican al confirmar.</p>{!cargando && !usuario && <p className="mb-4 text-sm text-[#604924]">Para finalizar tu pedido, necesitás iniciar sesión o crear una cuenta. Tu carrito se conserva.</p>}<Link to="/checkout"><Button className="w-full">{!cargando && !usuario ? "Ingresar para continuar" : "Continuar al checkout"}</Button></Link></Card></div>}
  </div>
}
