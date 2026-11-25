import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { authApi } from '../api/auth'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoError } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const desde = (location.state as {desde?: string} | null)?.desde
  const desdeCheckout = desde === '/checkout'
  const login = useAuthStore(s => s.login)
  const [error, setError] = useState('')
  const form = useForm({defaultValues: {username: '', full_name: '', email: '', password: ''}, onSubmit: async ({value}) => {
    try {
      setError('')
      await authApi.register(value)
      // Si venía del carrito, evitamos pedir las mismas credenciales otra vez.
      if (desdeCheckout) {
        try {
          await login(value.username, value.password)
          navigate('/checkout', {replace: true})
          return
        } catch {
          // La cuenta ya existe: puede iniciar sesión sin repetir el registro.
        }
      }
      navigate('/login', {replace: true, state: {registrado: true, desde, username: value.username}})
    } catch (e) {setError(handleApiError(e))}
  }})
  return <div className="mx-auto max-w-2xl py-4"><Card className="p-6 sm:p-10"><span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#bd4b30]">Tu primera visita</span><h1 className="titulo-seccion mb-2 mt-2">Sumate a <span className="titulo-editorial text-[#c3502b]">la mesa.</span></h1><p className="mb-8 text-sm text-[#6d806f]">Creá tu cuenta y pedí algo rico en minutos.</p>
    {desdeCheckout && <p role="status" className="mb-5 rounded-xl border border-[#e7d9b9] bg-[#fff5df] p-3 text-sm text-[#604924]">Creá tu cuenta para finalizar el pedido. Conservamos los productos de tu carrito.</p>}
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={e => {e.preventDefault(); e.stopPropagation(); void form.handleSubmit()}}>
      <form.Field name="username" validators={{onChange: ({value}) => value.trim().length < 3 ? 'Al menos 3 caracteres' : undefined}} children={f => <label className="block"><span className="etiqueta">Usuario</span><input className="campo" autoComplete="username" minLength={3} maxLength={50} required value={f.state.value} onChange={e => f.handleChange(e.target.value)} onBlur={f.handleBlur}/>{f.state.meta.errors.length > 0 && <small className="text-red-700">{f.state.meta.errors.join(', ')}</small>}</label>}/>
      <form.Field name="full_name" children={f => <label className="block"><span className="etiqueta">Nombre completo</span><input className="campo" autoComplete="name" required value={f.state.value} onChange={e => f.handleChange(e.target.value)}/></label>}/>
      <div className="sm:col-span-2"><form.Field name="email" validators={{onChange: ({value}) => !value.includes('@') ? 'Ingresá un correo válido' : undefined}} children={f => <label className="block"><span className="etiqueta">Correo electrónico</span><input className="campo" type="email" autoComplete="email" required value={f.state.value} onBlur={f.handleBlur} onChange={e => f.handleChange(e.target.value)}/>{f.state.meta.errors.length > 0 && <small className="text-red-700">{f.state.meta.errors.join(', ')}</small>}</label>}/></div>
      <div className="sm:col-span-2"><form.Field name="password" validators={{onChange: ({value}) => value.length < 8 ? 'Mínimo 8 caracteres' : new TextEncoder().encode(value).length > 72 ? 'Máximo 72 bytes' : undefined}} children={f => <label className="block"><span className="etiqueta">Contraseña</span><input className="campo" type="password" autoComplete="new-password" minLength={8} required value={f.state.value} onBlur={f.handleBlur} onChange={e => f.handleChange(e.target.value)}/>{f.state.meta.errors.length > 0 && <small className="text-red-700">{f.state.meta.errors.join(', ')}</small>}</label>}/></div>
      <div className="sm:col-span-2">{error && <EstadoError mensaje={error}/>}<form.Subscribe selector={state => state.isSubmitting}>{isSubmitting => <Button className="mt-3 w-full py-3" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando cuenta…' : 'Crear mi cuenta'}</Button>}</form.Subscribe></div>
    </form><p className="mt-6 text-center text-sm">¿Ya tenés cuenta? <Link className="font-bold text-[#b7472d] underline underline-offset-4" to="/login" state={{desde}}>Ingresá</Link></p>{desdeCheckout && <p className="mt-4 text-center text-sm"><Link to="/carrito" className="underline underline-offset-4">Volver a mi carrito</Link></p>}</Card>
  </div>
}
