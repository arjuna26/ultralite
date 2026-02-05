/**
 * CommunityTripsStacking
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

function TripCardContent({ trip, weightCategory, datesStr }) {
  return (
    <div
      className="rounded-2xl p-10 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
      }}
    >
      <div className="grid grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">{trip.trip_name}</h3>
          <p className="text-sm text-neutral-600">
            {trip.user_nickname}
            {trip.location_text && ` · ${trip.location_text}`}
          </p>
          {datesStr && <p className="text-xs text-neutral-500">{datesStr}</p>}

          {trip.total_weight_grams != null && weightCategory && (
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: weightCategory.color }}>
                  {(trip.total_weight_grams / 1000).toFixed(2)} kg
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: `${weightCategory.color}20`,
                    color: weightCategory.color,
                  }}
                >
                  {weightCategory.label}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl overflow-hidden bg-neutral-100 aspect-[16/10] flex items-center justify-center">
          {trip.backpack_image_url ? (
            <img src={trip.backpack_image_url} className="object-contain w-full h-full" />
          ) : (
            <BackpackPlaceholderIcon />
          )}
        </div>
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
        offset.current =
          (offset.current +
            BASE_SPEED_PX_PER_SEC * speedMultiplier.current * dt) %
          stripWidth;

        trackRef.current.style.transform =
          `translate3d(${-offset.current}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paused, stripWidth]);

  return trackRef;
}

/* ================= main ================= */

export default function CommunityTripsStacking({ trips }) {
  const loopTrips = [...trips, ...trips];

  const STRIP_WIDTH =
    trips.length * CARD_WIDTH_PX +
    (trips.length - 1) * GAP_PX;

  const containerRef = useRef(null);
  const hoverRef = useRef(null);

  const marqueeRef = useMarquee({
    stripWidth: STRIP_WIDTH,
    hoverRef,
    containerRef,
  });

  return (
    <>
      {/* Desktop */}
      <div
        ref={containerRef}
        className="hidden md:block overflow-hidden py-24"
      >
        <div ref={hoverRef}>
          <div
            ref={marqueeRef}
            className="flex will-change-transform"
            style={{ gap: `${GAP_PX}px` }}
          >
            {loopTrips.map((trip, index) => (
              <div
                key={`${trip.trip_id ?? index}-${index}`}
                style={{ width: CARD_WIDTH_PX }}
                className="flex-shrink-0"
              >
                <TripCardContent
                  trip={trip}
                  weightCategory={getWeightCategory(trip.total_weight_grams)}
                  datesStr={formatTripDates(trip.start_date, trip.end_date)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden container px-4 py-8 space-y-6">
        {trips.map((trip, index) => (
          <div key={trip.trip_id ?? index} className="card overflow-hidden">
            <TripCardContent
              trip={trip}
              weightCategory={getWeightCategory(trip.total_weight_grams)}
              datesStr={formatTripDates(trip.start_date, trip.end_date)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
