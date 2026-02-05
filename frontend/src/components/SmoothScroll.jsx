import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

let lenisInstance = null

export function getLenis() {
  return lenisInstance
}

export default function SmoothScroll({ children }) {
  useEffect(() => {
    lenisInstance = new Lenis({
      smoothWheel: true,
      lerp: 0.08
    })

    const raf = (time) => {
      lenisInstance.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenisInstance.destroy()
      lenisInstance = null
    }
  }, [])

  return children
}
