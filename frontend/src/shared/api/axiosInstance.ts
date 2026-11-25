import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { queryClient } from './queryClient'
import { useCartStore } from '../../store/cartStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const requestUrl = error.config?.url ?? ''
      const detail: unknown = error.response?.data?.detail
      if ((error.response?.status === 401 && !requestUrl.includes('/auth/token') && !requestUrl.includes('/auth/me')) ||
          (error.response?.status === 400 && detail === 'Cuenta de usuario desactivada')) {
        queryClient.clear()
        useCartStore.getState().setOwner(null)
        useAuthStore.setState({ usuario: null })
      }
    }
    return Promise.reject(error)
  },
)
