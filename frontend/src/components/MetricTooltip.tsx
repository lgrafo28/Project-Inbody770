import { useState, useRef, useEffect } from 'react';
import { METRIC_INFO } from '../lib/metricInfo';

interface MetricTooltipProps {
  metricKey: string;
  /** Optional dynamic sentence appended below the static copy. */
  contextNote?: string;
}

/**
 * Inline info icon with a premium tooltip/popover.
 *
 * Desktop  — shows on hover (CSS-class-based via group + mouseenter/leave with a
 *            small leave-delay so the gap between icon and popover doesn't flicker).
 * Mobile   — toggles on tap/click; closes on outside tap.
 */
export function MetricTooltip({ metricKey, contextNote }: MetricTooltipProps) {
  const info = METRIC_INFO[metricKey];
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click/tap (mobile)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  if (!info) return null;

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay bridges the 8px gap between the icon and the popover
    leaveTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpen((o) => !o);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Info icon — subtle by default, slightly more prominent on hover/open */}
      <button
        type="button"
        aria-label={`Mehr zu ${info.title}`}
        onClick={handleClick}
        className={`flex items-center justify-center rounded-full transition-colors duration-150 ml-1 ${
          open
            ? 'text-primary'
            : 'text-outline/50 hover:text-on-surface-variant'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] bg-white border border-outline-variant/20 rounded-xl shadow-[0_8px_40px_rgba(0,63,135,0.10)] p-5"
          style={{ minWidth: '260px' }}
        >
          {/* Arrow */}
          <div className="absolute -top-[7px] left-3 w-3 h-3 bg-white border-l border-t border-outline-variant/20 rotate-45" />

          <p className="font-headline font-bold text-[11px] uppercase tracking-wider text-primary mb-2">
            {info.title}
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {info.body}
          </p>

          {contextNote && (
            <p className="mt-3 pt-3 border-t border-outline-variant/10 text-xs text-on-surface-variant/70 leading-relaxed italic">
              {contextNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
