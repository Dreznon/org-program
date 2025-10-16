import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ label: string }>

export default function FormField({ label, children }: Props) {
  return (
    <label style={{ display:'grid', gap:6 }}>
      <span style={{ color:'#64748b', fontSize:12 }}>{label}</span>
      {children}
    </label>
  )
}


