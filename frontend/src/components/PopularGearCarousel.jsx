/**
 * PopularGearCarousel
 *
 * Desktop:
 * - GPU-perfect marquee carousel
 * - requestAnimationFrame driven
 * - Seamless looping (no jumps)
 * - Lenis-safe
 * - Hover slow-down
 * - Pauses when offscreen or tab hidden
 * - Respects prefers-reduced-motion
 *
 * Mobile:
 * - Static vertical list
 */

import { useEffect, useRef, useState } from 'react';

/* ================= constants ================= */

const CARD_WIDTH_PX = 420;
const CARD_HEIGHT_PX = 280;
const GAP_PX = 64;

const BASE_SPEED_PX_PER_SEC = 80;
const HOVER_SPEED_MULTIPLIER = 0.5;

/* ================= helpers ================= */

function formatTripDates(startDate, endDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  if (!endDate || endDate === startDate) {
    return start.toLocaleDateString('en-US', opts);
  }
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function getWeightCategory(grams) {
  if (grams == null) return null;
  const kg = grams / 1000;
  if (kg < 5) return { label: 'Ultralight', color: 'var(--color-primary-600)' };
  if (kg < 9) return { label: 'Light', color: 'var(--color-success-600)' };
  if (kg < 13) return { label: 'Standard', color: 'var(--color-warning-600)' };
  return { label: 'Heavy', color: 'var(--color-accent-600)' };
}

/* ================= icons ================= */

const BackpackPlaceholderIcon = () => (
  <svg
    className="w-20 h-20"
    style={{ color: 'var(--color-neutral-400)' }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
    />
  </svg>
);

/* ================= card ================= */

function GearCardContent({ gear, weightCategory }) {
  return (
    <div className="flex flex-col gap-4 items-center h-full w-full">
      {/* Image floats with subtle shadow */}
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          width: '100%',
          height: 250,
          minHeight: 250
        }}
      >
        {gear.image_url ? (
          <img
            src={gear.image_url}
            alt=""
            className="object-contain max-w-full max-h-full w-auto h-auto"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
            <BackpackPlaceholderIcon />
          </div>
        )}
      </div>
      {/* Brand / model and weight float below */}
      <div className="flex flex-col items-center text-center min-w-0">
        <h3 className="text-xl font-semibold truncate max-w-full" style={{ color: 'var(--color-neutral-900)' }}>
          {gear.brand} {gear.model}
        </h3>
        {gear.weight_grams != null && weightCategory && (
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-sm" style={{ color: weightCategory.color }}>
              {gear.weight_grams}g
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= marquee hook ================= */

function useMarquee({ stripWidth, hoverRef, containerRef }) {
  const trackRef = useRef(null);
  const offset = useRef(0);
  const lastTime = useRef(0);
  const speedMultiplier = useRef(1);

  const [paused, setPaused] = useState(false);

  /* prefers-reduced-motion */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setPaused(true);
  }, []);

  /* tab visibility */
  useEffect(() => {
    const onVisibility = () => {
      setPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* intersection pause */
  useEffect(() => {
    if (!containerRef.current) return;

    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0 }
    );

    io.observe(containerRef.current);
    return () => io.disconnect();
  }, [containerRef]);

  /* hover slow-down */
  useEffect(() => {
    if (!hoverRef.current) return;

    const enter = () => (speedMultiplier.current = HOVER_SPEED_MULTIPLIER);
    const leave = () => (speedMultiplier.current = 1);

    hoverRef.current.addEventListener('mouseenter', enter);
    hoverRef.current.addEventListener('mouseleave', leave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', enter);
      hoverRef.current?.removeEventListener('mouseleave', leave);
    };
  }, [hoverRef]);

  /* RAF loop */
  useEffect(() => {
    if (!trackRef.current) return;
    let rafId;
    const tick = (t) => {
      if (!lastTime.current) lastTime.current = t;
      const dt = (t - lastTime.current) / 1000;
      lastTime.current = t;

      if (!paused) {
        offset.current += BASE_SPEED_PX_PER_SEC * speedMultiplier.current * dt;
        if (offset.current >= stripWidth) {
          // wrap after one copy
          offset.current -= stripWidth;
        }
        trackRef.current.style.transform = `translate3d(${-offset.current}px,0,0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paused, stripWidth]);

  return trackRef;
}

/* ================= main ================= */

export default function PopularGearCarousel({ gear = [] }) {
  const containerRef = useRef(null);

  /* 1. Determine how many copies are needed  */
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    if (!gear.length) return;
    const updateCopies = () => {
      const containerW = containerRef.current?.offsetWidth ?? 0;
      const oneCopyW = gear.length * CARD_WIDTH_PX + gear.length * GAP_PX;
      const needed = Math.ceil(containerW / oneCopyW) + 1;
      setCopies(needed);
    };
    updateCopies();
    window.addEventListener('resize', updateCopies);
    return () => window.removeEventListener('resize', updateCopies);
  }, [gear]);

  /* 2. Build the duplicated list  */
  const loopGearItems = Array.from({ length: copies }, () => gear).flat();

  /* 3. Width of ONE copy (this is what we wrap at for seamless looping)  */
  const ONE_COPY_WIDTH = gear.length * CARD_WIDTH_PX + gear.length * GAP_PX;

  const hoverRef = useRef(null);
  const marqueeRef = useMarquee({
    stripWidth: ONE_COPY_WIDTH,
    hoverRef,
    containerRef,
  });

  if (!gear.length) {
    return null;
  }

  return (
    <div ref={containerRef} className="block md:py-24 py-8">
      <div ref={hoverRef}>
        <div
          ref={marqueeRef}
          className="flex"
          style={{ gap: `${GAP_PX}px` }}
        >
          {loopGearItems.map((item, index) => (
            <div
              key={`${item.gear_id ?? item.id ?? index}-${index}`}
              className="flex-shrink-0 rounded-2xl h-full"
              style={{
                width: CARD_WIDTH_PX,
                height: CARD_HEIGHT_PX,
                minWidth: CARD_WIDTH_PX,
                minHeight: CARD_HEIGHT_PX,
                backgroundColor: 'transparent'
              }}
            >
              <GearCardContent
                gear={item}
                weightCategory={getWeightCategory(item.weight_grams)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}