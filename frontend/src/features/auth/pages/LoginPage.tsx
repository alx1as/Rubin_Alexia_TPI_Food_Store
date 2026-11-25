import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoError } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useAuthStore } from '../../../store/authStore'
export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const estado = location.state as {desde?: string; registrado?: boolean; username?: string} | null
  const desde = estado?.desde
  const desdeCheckout = desde === '/checkout'
  const [error, setError] = useState('')
  const form = useForm({defaultValues: {username: estado?.username ?? '', password: ''}, onSubmit: async ({value}) => {
    try { setError(''); await login(value.username, value.password); navigate(desde ?? (useAuthStore.getState().usuario?.role === 'admin' ? '/admin/resumen' : '/'), {replace: true}) }
    catch (e) {setError(handleApiError(e))}
  }})
  return <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#e5e0d4] bg-[#fffefa] md:grid-cols-2">
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#263f33] p-10 text-white md:flex"><div><span className="inline-block rounded-full border border-[#edcb82] px-4 py-2 text-xs font-extrabold tracking-[.16em] text-[#f3d687]">TU MESA TE ESPERA</span><h2 className="mt-7 text-5xl font-black leading-[.98] tracking-tight">Lo bueno <span className="titulo-editorial block text-[#f2c676]">se comparte.</span></h2><p className="mt-5 max-w-xs leading-relaxed text-[#c9d8cb]">Volvé a tus favoritos, armá tu pedido y seguí cada paso.</p></div><div className="relative grid h-64 place-items-center"><div className="hero-plato absolute h-54 w-54"/><span className="relative -rotate-12 text-[9rem] drop-shadow-xl" aria-hidden>🍕</span></div><span className="text-xs text-[#c9d8cb]">Hecho con hambre de cosas ricas. ✳</span></aside>
    <div className="px-6 py-10 sm:px-12 sm:py-14"><Card className="border-none p-0 shadow-none"><span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#bd4b30]">Bienvenido a Food Store</span><h1 className="titulo-seccion mb-3 mt-3">Ingresá a <span className="titulo-editorial">tu cuenta.</span></h1><p className="mb-8 text-sm text-[#7a8577]">Qué bueno verte otra vez.</p>
      {desdeCheckout && <p role="status" className="mb-5 rounded-xl border border-[#e7d9b9] bg-[#fff5df] p-3 text-sm text-[#604924]">Iniciá sesión o creá una cuenta para finalizar tu pedido. Tu carrito está guardado.</p>}
      {estado?.registrado && <p role="status" className="mb-5 rounded-xl border border-[#bed7bd] bg-[#e6f3e2] p-3 text-sm font-semibold text-[#275936]">Cuenta creada. Ya podés ingresar.</p>}
      <form className="space-y-5" onSubmit={e => {e.preventDefault(); e.stopPropagation(); void form.handleSubmit()}}>
        <form.Field name="username" validators={{onChange: ({value}) => value.trim().length === 0 ? 'Ingresá tu usuario' : undefined}} children={field => <label className="block"><span className="etiqueta">Usuario</span><input className="campo" autoComplete="username" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)} required/>{field.state.meta.errors.length > 0 && <small className="text-red-700">{field.state.meta.errors.join(', ')}</small>}</label>}/>
        <form.Field name="password" children={field => <label className="block"><span className="etiqueta">Contraseña</span><input className="campo" type="password" autoComplete="current-password" value={field.state.value} onChange={e => field.handleChange(e.target.value)} required/></label>}/>
        {error && <EstadoError mensaje={error}/>}<form.Subscribe selector={state => state.isSubmitting}>{isSubmitting => <Button className="w-full py-3" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Ingresar a mi cuenta'}</Button>}</form.Subscribe>
      </form><p className="mt-7 text-center text-sm text-[#728274]">¿No tenés cuenta? <Link to="/register" state={{desde}} className="font-bold text-[#bb4a2c] underline underline-offset-4">Registrate</Link></p>{desdeCheckout && <p className="mt-4 text-center text-sm"><Link to="/carrito" className="underline underline-offset-4">Volver a mi carrito</Link></p>}
    </Card></div>
  </div>
}
