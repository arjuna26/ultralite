import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { lenis } from './SmoothScroll'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!lenis) return
    lenis.scrollTo(0, { immediate: false })
  }, [pathname])

  return null
}
