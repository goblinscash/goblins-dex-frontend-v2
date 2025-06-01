// Tooltip.tsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  contentClassName?: string;
  showArrow?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement: preferredPlacement = 'top',
  className = '',
  contentClassName = '',
  showArrow = true,
}) => {
  // ---------------------------------------------------
  // State & refs
  // ---------------------------------------------------
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [actualPlacement, setActualPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>(
    preferredPlacement
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------
  // Recalculate position using getBoundingClientRect only
  // useLayoutEffect so it happens before paint
  // ---------------------------------------------------
  useLayoutEffect(() => {
    if (!isVisible) return;

    const calculatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      // 1) Get trigger and tooltip bounding boxes (viewport‐relative)
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // 2) Start with the “preferredPlacement” (e.g. 'top')
      let newPlacement: 'top' | 'bottom' | 'left' | 'right' = preferredPlacement;

      // 3) Attempt to place tooltip.  If no room, flip to opposite side.
      let top: number, left: number;

      const SPACE = 8; // 8px gap between trigger and tooltip
      const V_PADDING = 10; // min vertical padding from window edges
      const H_PADDING = 10; // min horizontal padding from window edges

      // Helper to check if there's enough space on a given side
      const hasSpaceOnTop = () => triggerRect.top >= tooltipRect.height + SPACE + V_PADDING;
      const hasSpaceOnBottom = () =>
        window.innerHeight - triggerRect.bottom >= tooltipRect.height + SPACE + V_PADDING;
      const hasSpaceOnLeft = () => triggerRect.left >= tooltipRect.width + SPACE + H_PADDING;
      const hasSpaceOnRight = () =>
        window.innerWidth - triggerRect.right >= tooltipRect.width + SPACE + H_PADDING;

      // If the user said “top” but we don’t really have room, let’s flip to “bottom.”
      if (preferredPlacement === 'top' && !hasSpaceOnTop() && hasSpaceOnBottom()) {
        newPlacement = 'bottom';
      } else if (preferredPlacement === 'bottom' && !hasSpaceOnBottom() && hasSpaceOnTop()) {
        newPlacement = 'top';
      } else if (preferredPlacement === 'left' && !hasSpaceOnLeft() && hasSpaceOnRight()) {
        newPlacement = 'right';
      } else if (preferredPlacement === 'right' && !hasSpaceOnRight() && hasSpaceOnLeft()) {
        newPlacement = 'left';
      } else {
        newPlacement = preferredPlacement;
      }

      // 4) Based on final placement, compute (top, left)
      switch (newPlacement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - SPACE;
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;

        case 'bottom':
          top = triggerRect.bottom + SPACE;
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;

        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left - tooltipRect.width - SPACE;
          break;

        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + SPACE;
          break;
      }

      // 5) Clamp so that tooltip never goes outside viewport by 10px
      if (left < H_PADDING) {
        left = H_PADDING;
      }
      if (left + tooltipRect.width > window.innerWidth - H_PADDING) {
        left = window.innerWidth - tooltipRect.width - H_PADDING;
      }
      if (top < V_PADDING) {
        top = V_PADDING;
      }
      if (top + tooltipRect.height > window.innerHeight - V_PADDING) {
        top = window.innerHeight - tooltipRect.height - V_PADDING;
      }

      setTooltipPosition({ top, left });
      setActualPlacement(newPlacement);
    };

    // Run once immediately
    calculatePosition();

    // Also re‐calculate on scroll or resize
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible, preferredPlacement]);

  // ---------------------------------------------------
  // Mouse handlers
  // ---------------------------------------------------
  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  // ---------------------------------------------------
  // Convenience: arrow CSS classes (Tailwind)
  // ---------------------------------------------------
  const getArrowClasses = (placement: typeof actualPlacement) => {
    // Each arrow is a zero‐width, zero‐height <div> with border‐color trick
    switch (placement) {
      case 'top':
        return 'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full ' +
               'border-t-black border-x-transparent border-b-0 border-l-transparent border-r-transparent';
      case 'bottom':
        return 'absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full ' +
               'border-b-black border-x-transparent border-t-0 border-l-transparent border-r-transparent';
      case 'left':
        return 'absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 ' +
               'border-l-black border-y-transparent border-r-0 border-t-transparent border-b-transparent';
      case 'right':
        return 'absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 ' +
               'border-r-black border-y-transparent border-l-0 border-t-transparent border-b-transparent';
      default:
        return '';
    }
  };

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <div
      ref={triggerRef}
      className={`tooltip-trigger inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            className="tooltip-content fixed z-50"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <div
              className={`bg-black text-white border border-gray-800 rounded-md shadow-lg py-2 px-3 relative ${contentClassName}`}
            >
              {content}

              {showArrow && (
                <div className={`w-0 h-0 border-8 ${getArrowClasses(actualPlacement)}`}></div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
