import { useEffect, useRef } from 'react'
import { useAuthStore } from './store/authStore'
import { AppRouter } from './routes/AppRouter'

export function App() {
  const checkSession = useAuthStore((s) => s.checkSession)
  const cargando = useAuthStore((s) => s.cargando)
  const sesionConsultada = useRef(false)

  useEffect(() => {
    // React.StrictMode ejecuta los efectos dos veces en desarrollo.
    // Evita dos consultas /auth/me simultaneas y borrados de cache tardios.
    if (sesionConsultada.current) return
    sesionConsultada.current = true
    void checkSession()
  }, [checkSession])

  if (cargando) {
    return <div className="mx-auto max-w-4xl px-5 py-20 text-center text-[#66776e]">Comprobando sesión…</div>
  }

  return <AppRouter />
}
