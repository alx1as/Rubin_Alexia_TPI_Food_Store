import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { EstadoError } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
import { dinero } from '../../productos/components/ProductoCard'

export function CheckoutPage() {
  const items = useCartStore((s)=>s.items)
  const vaciar = useCartStore((s)=>s.vaciar)
  const total = useCartStore((s)=>s.total())
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error,setError]=useState('')
  const form=useForm({defaultValues:{direccion_entrega:'',forma_pago:'EFECTIVO' as FormaPago, notas:''},onSubmit:async ({value})=>{
    try {setError('');await crear.mutateAsync({...value, items:items.map(i=>({producto_id:i.producto_id,cantidad:i.cantidad}))});vaciar();navigate(useAuthStore.getState().usuario?.role === 'admin' ? '/admin/pedidos' : '/mis-pedidos')}
    catch(e){setError(handleApiError(e))}
  }})
  if(items.length===0)return <Card><p>Tu carrito está vacío.</p><Link to="/">Volver al menú</Link></Card>
  return <div className="mx-auto max-w-3xl"><h1 className="titulo-seccion mb-7">Confirmar pedido</h1><Card className="p-7"><form onSubmit={e=>{e.preventDefault();e.stopPropagation();void form.handleSubmit()}} className="space-y-5">
    <form.Field name="direccion_entrega" validators={{onChange:({value})=>value.trim().length<5?'Ingresá una dirección de al menos 5 caracteres':undefined}} children={f=><label className="block"><span className="etiqueta">Dirección de entrega</span><input className="campo" placeholder="Calle, número y referencia" minLength={5} maxLength={200} required value={f.state.value} onBlur={f.handleBlur} onChange={e=>f.handleChange(e.target.value)}/>{f.state.meta.errors.length>0&&<small className="text-red-700">{f.state.meta.errors.join(', ')}</small>}</label>}/>
    <form.Field name="forma_pago" children={f=><label className="block"><span className="etiqueta">Forma de pago</span><select className="campo" value={f.state.value} onChange={e=>f.handleChange(e.target.value as FormaPago)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option></select></label>}/>
    <form.Field name="notas" children={f=><label className="block"><span className="etiqueta">Notas (opcional)</span><textarea className="campo" rows={3} placeholder="Indicaciones para el pedido" value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/></label>}/>
    <div className="rounded-xl bg-[#f0f5ee] p-4"><h2 className="mb-3 font-bold">Resumen</h2>{items.map(i=><p className="flex justify-between text-sm" key={i.producto_id}><span>{i.cantidad} × {i.nombre}</span><span>{dinero(i.cantidad*i.precio_unitario)}</span></p>)}<div className="mt-4 flex justify-between border-t border-[#cbdccf] pt-3"><strong>Total estimado</strong><strong>{dinero(total)}</strong></div></div>
    {error&&<EstadoError mensaje={error}/>}<Button type="submit" className="w-full" disabled={crear.isPending}>{crear.isPending ? "Procesando tu pedido…" : "Confirmar y realizar pedido"}</Button><p className="text-center text-xs text-[#768778]">El pago es manual, sin pasarela online.</p>
  </form></Card></div>
}
