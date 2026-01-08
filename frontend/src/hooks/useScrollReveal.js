import { useEffect } from 'react';

/**
 * Hook to add scroll reveal animations to elements
 * Adds 'revealed' class to elements with 'scroll-reveal' class when they enter viewport
 */
export function useScrollReveal() {
  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show all elements
      document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale')
        .forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Stop observing once revealed (one-time animation)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully visible
        threshold: 0.1, // 10% of element visible
      }
    );

    // Observe all scroll-reveal elements
    const elements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );
    
    elements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);
}

export default useScrollReveal;
