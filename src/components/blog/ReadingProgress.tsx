'use client'

import { useEffect, useState } from 'react'

const ReadingProgress = ({ targetId }: { targetId: string }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return
    let frame = 0
    const update = () => {
      const rect = target.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      setProgress(total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [targetId])

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none">
      <div
        className="h-full bg-[#B7FE1A] origin-left"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
export default ReadingProgress
