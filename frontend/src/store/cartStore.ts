import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../features/productos/types'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
}

type OwnerKey = `user:${number}` | 'guest'

interface CartState {
  // El carrito visible siempre corresponde a ownerKey.
  items: CartItem[]
  ownerKey: OwnerKey | null
  carts: Record<string, CartItem[]>
  setOwner: (usuarioId: number | null, transferirInvitado?: boolean) => void
  agregar: (producto: Producto) => void
  quitar: (producto_id: number) => void
  cambiarCantidad: (producto_id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

function combinarCarritos(guardado: CartItem[], invitado: CartItem[]): CartItem[] {
  const combinados = new Map<number, CartItem>(
    guardado.map((item): [number, CartItem] => [item.producto_id, { ...item }]),
  )
  for (const item of invitado) {
    const existente = combinados.get(item.producto_id)
    if (existente) {
      combinados.set(item.producto_id, { ...existente, cantidad: existente.cantidad + item.cantidad })
    } else {
      combinados.set(item.producto_id, { ...item })
    }
  }
  // El backend controla definitivamente disponibilidad, precios y stock al confirmar.
  return [...combinados.values()]
}

export const useCartStore = create<CartState>()(persist((set, get) => {
  const actualizarItems = (items: CartItem[]) => set((state) => {
    const owner = state.ownerKey ?? 'guest'
    return { items, carts: { ...state.carts, [owner]: items } }
  })

  return {
    items: [],
    // No se persiste la identidad activa: se reconstruye desde /auth/me al iniciar.
    ownerKey: null,
    carts: {},
    setOwner: (usuarioId, transferirInvitado = false) => set((state) => {
      const nuevoOwner: OwnerKey = usuarioId === null ? 'guest' : `user:${usuarioId}`
      if (state.ownerKey === nuevoOwner) return state

      const carts = { ...state.carts }
      if (state.ownerKey !== null) carts[state.ownerKey] = state.items
      let items = [...(carts[nuevoOwner] ?? [])]

      // Permite agregar al carrito antes del login, sin trasladar carritos de otras cuentas.
      if (transferirInvitado && usuarioId !== null && (carts.guest?.length ?? 0) > 0) {
        items = combinarCarritos(items, carts.guest)
        carts.guest = []
      }
      carts[nuevoOwner] = items
      return { ownerKey: nuevoOwner, items, carts }
    }),
    agregar: (producto) => {
      if (!producto.activo || !producto.disponible || producto.stock < 1) return
      const items = get().items
      const existente = items.find((item) => item.producto_id === producto.id)
      if (existente) {
        actualizarItems(items.map((item) => item.producto_id === producto.id
          ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
          : item))
      } else {
        actualizarItems([...items, {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: producto.precio_base,
          cantidad: 1,
          imagen_url: producto.imagen_url,
        }])
      }
    },
    quitar: (id) => actualizarItems(get().items.filter((item) => item.producto_id !== id)),
    cambiarCantidad: (id, cantidad) => actualizarItems(get().items.map((item) => item.producto_id === id
      ? { ...item, cantidad: Number.isFinite(cantidad) ? Math.max(1, Math.trunc(cantidad)) : 1 }
      : item)),
    vaciar: () => actualizarItems([]),
    total: () => get().items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0),
  }
}, {
  // La versión anterior guardaba todos los productos en una sola clave sin dueño.
  // No es seguro adjudicar ese contenido a ninguna cuenta: se empieza limpio una vez.
  name: 'food-store-carts-v2',
  partialize: (state) => ({ carts: state.carts }),
}))
