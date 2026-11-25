import axios from 'axios'
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((item: unknown) =>
        typeof item === 'object' && item !== null && 'msg' in item ? String(item.msg) : 'Error de validación'
      ).join('; ')
    }
    if (!error.response) return 'No se pudo conectar con el servidor. Verificá que esté encendido.'
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}
