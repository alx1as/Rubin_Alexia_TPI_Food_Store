import type { ReactNode } from 'react'
export function Card({ children, className = '' }: {children: ReactNode; className?: string}) {
  return <div className={`rounded-2xl border border-[#e6e3d9] bg-[#fffefa] p-5 shadow-[0_4px_28px_rgba(35,46,35,0.045)] ${className}`}>{children}</div>
}
