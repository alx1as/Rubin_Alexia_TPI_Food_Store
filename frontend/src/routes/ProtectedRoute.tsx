import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
export function ProtectedRoute({rol}: {rol?: 'admin'}) {
  const usuario = useAuthStore((s)=>s.usuario)
  const cargando = useAuthStore((s)=>s.cargando)
  const location = useLocation()
  if (cargando) return <div className="mx-auto max-w-4xl px-5 py-20 text-center text-[#66776e]">Comprobando sesión…</div>
  if (!usuario) return <Navigate to="/login" replace state={{desde: location.pathname}}/>
  if (rol && usuario.role!==rol) return <Navigate to="/unauthorized" replace/>
  return <Outlet/>
}
