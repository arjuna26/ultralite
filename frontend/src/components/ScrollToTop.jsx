import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from './SmoothScroll'

const lenis = getLenis();

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: false })
      return
    }
    const intervalId = setInterval(() => {
      if (!lenis) return
      lenis.scrollTo(0, { immediate: false })
      clearInterval(intervalId)
    }, 16)
  }, [pathname])

  return null
}
