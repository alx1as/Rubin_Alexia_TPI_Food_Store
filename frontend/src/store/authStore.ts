import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../features/auth/api/auth'
import type { Usuario } from '../features/auth/types'
import { queryClient } from '../shared/api/queryClient'
import { useCartStore } from './cartStore'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  usuario: null,
  cargando: true,
  login: async (username, password) => {
    await authApi.login(username, password)
    queryClient.clear()
    const usuario = await authApi.me()
    // Solo se transfieren los productos del visitante, nunca de otro usuario autenticado.
    useCartStore.getState().setOwner(usuario.id, true)
    set({ usuario, cargando: false })
  },
  logout: async () => {
    try { await authApi.logout() }
    finally {
      queryClient.clear()
      useCartStore.getState().setOwner(null)
      set({ usuario: null, cargando: false })
    }
  },
  checkSession: async () => {
    set({ cargando: true })
    try {
      const usuario = await authApi.me()
      useCartStore.getState().setOwner(usuario.id)
      set({ usuario })
    } catch {
      // Las consultas publicas deben conservar su cache si el visitante
      // nunca estuvo autenticado. Solo limpiamos datos si habia una sesion.
      if (useAuthStore.getState().usuario !== null) {
        queryClient.clear()
      }
      useCartStore.getState().setOwner(null)
      set({ usuario: null })
    } finally {
      set({ cargando: false })
    }
  },
}), { name: 'food-store-auth', partialize: (state) => ({ usuario: state.usuario }) }))
