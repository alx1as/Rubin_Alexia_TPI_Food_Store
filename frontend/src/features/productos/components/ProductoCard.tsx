import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types'

export const dinero = (n: number) => new Intl.NumberFormat('es-AR', {style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2}).format(n)

const visuales = {
  hamburguesa: { icono: '🍔', fondo: 'from-[#f4ce8f] to-[#edaa79]' },
  pizza: { icono: '🍕', fondo: 'from-[#efb69b] to-[#d98670]' },
  bebida: { icono: '🥤', fondo: 'from-[#d0ddbe] to-[#9ec3aa]' },
  otro: { icono: '🍽️', fondo: 'from-[#e0dcc2] to-[#a9c4a3]' },
} as const
export function visualProducto(producto: Producto) {
  const categoria = producto.categoria.nombre.toLocaleLowerCase('es-AR')
  if (categoria.includes('hamburg')) return visuales.hamburguesa
  if (categoria.includes('pizza')) return visuales.pizza
  if (categoria.includes('bebida')) return visuales.bebida
  return visuales.otro
}
export function ProductoCard({producto}: {producto: Producto}) {
  const agregar = useCartStore((s) => s.agregar)
  const [imagenFallida, setImagenFallida] = useState<string | null>(null)
  const cantidad = useCartStore((s) => s.items.find(i => i.producto_id === producto.id)?.cantidad ?? 0)
  const habilitado = producto.disponible && producto.stock > 0
  const visual = visualProducto(producto)
  return <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[#e5dfd3] bg-[#fffefa] shadow-[0_5px_20px_#2835280a] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_26px_#28352815]">
    <div className={`producto-visual h-52 bg-gradient-to-br ${visual.fondo}`}>
      {producto.imagen_url && imagenFallida !== producto.imagen_url ? <img onError={() => setImagenFallida(producto.imagen_url)} src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" loading="eager"/> : <span className="producto-emoji select-none text-[7.6rem]" aria-hidden>{visual.icono}</span>}
      {!habilitado && <span className="absolute right-4 top-4 rounded-full bg-[#253d31] px-3 py-1 text-xs font-semibold text-white">Agotado</span>}
      <span className="absolute bottom-3 left-4 rounded-full bg-[#fffefa]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.13em] text-[#3b5646]">{producto.categoria.nombre}</span>
    </div>
    <div className="flex flex-1 flex-col p-5"><h3 className="mb-2 text-xl font-black tracking-tight text-[#283e30]">{producto.nombre}</h3>
      <p className="mb-5 min-h-12 flex-1 text-sm leading-relaxed text-[#697365]">{producto.descripcion ?? 'Preparado especialmente para vos.'}</p>
      <div className="raya-decorativa mb-4"/><div className="flex items-center justify-between gap-3"><div><strong className="text-2xl font-black tracking-tight text-[#263d31]">{dinero(producto.precio_base)}</strong><p className="text-xs text-[#7b8276]">{habilitado ? `${producto.stock} disponibles` : 'No disponible'}</p></div><Button disabled={!habilitado || cantidad >= producto.stock} onClick={() => agregar(producto)} aria-label={`Agregar ${producto.nombre} al carrito`}>{cantidad >= producto.stock && habilitado ? "Stock en carrito" : "Agregar"} <span aria-hidden>＋</span></Button></div>
    </div>
  </article>
}
