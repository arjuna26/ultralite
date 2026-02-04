import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export let lenis

export default function SmoothScroll({ children }) {
  useEffect(() => {
    lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.09
    })

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenis = null
    }
  }, [])

  return children
}
