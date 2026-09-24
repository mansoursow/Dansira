import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  hint: ReactNode
  tone?: 'default' | 'muted'
}

export default function KpiCard({ label, value, hint, tone = 'default' }: Props) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      <div className="kpi__hint">{hint}</div>
    </div>
  )
}
