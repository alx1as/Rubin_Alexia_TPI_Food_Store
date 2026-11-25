import type { ButtonHTMLAttributes, ReactNode } from 'react'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' | 'light'; children: ReactNode }
export function Button({ variant = 'primary', className = '', children, ...props }: Props) {
  const styles = {
    primary: 'bg-[#c3502b] text-white hover:bg-[#a94325] shadow-[0_5px_0_#7c352216] active:translate-y-[1px]',
    outline: 'border border-[#d5d9cf] bg-[#fffefa] text-[#2d4437] hover:bg-[#f2efe7]',
    danger: 'bg-[#fff0e9] text-[#a23e27] border border-[#efc5b9] hover:bg-[#fbe2d8]',
    light: 'bg-[#e4eadb] text-[#254534] hover:bg-[#d6e2cd]',
  }
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}>{children}</button>
}
