'use client'

import { EquipmentDetailCard, type EquipmentDetail } from './EquipmentDetailCard'

export function EquipmentList({ items }: { items: EquipmentDetail[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <EquipmentDetailCard key={`${item.category}-${idx}`} item={item} />
      ))}
    </div>
  )
}
