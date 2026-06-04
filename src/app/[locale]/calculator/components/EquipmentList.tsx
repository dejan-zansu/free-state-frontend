'use client'

import { EquipmentDetailCard, type EquipmentDetail } from './EquipmentDetailCard'

export function EquipmentList({ items }: { items: EquipmentDetail[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
      {items.map((item, idx) => (
        <EquipmentDetailCard key={`${item.category}-${idx}`} item={item} />
      ))}
    </div>
  )
}
