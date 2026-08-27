import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

export type AgenticTerm = {
  label: string;
  category: 'Method' | 'Pattern' | 'Tool';
  description: string;
};

type AgenticCloudProps = {
  terms: AgenticTerm[];
};

type TooltipPosition = {
  top: number;
  left: number;
  anchorX: number;
  placement: 'above' | 'below';
};

const tooltipId = 'agentic-term-tooltip';

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
}

function TypewriterText({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setCharacterCount(text.length);
      return;
    }

    let currentCharacter = 0;
    let timeoutId = 0;

    setCharacterCount(0);

    const typeNextCharacter = () => {
      currentCharacter += 1;
      setCharacterCount(currentCharacter);

      if (currentCharacter >= text.length) return;

      const typedCharacter = text[currentCharacter - 1];
      const delay = /[.!?]/.test(typedCharacter)
        ? 105
        : typedCharacter === ','
          ? 55
          : typedCharacter === ' '
            ? 9
            : 15;

      timeoutId = window.setTimeout(typeNextCharacter, delay);
    };

    timeoutId = window.setTimeout(typeNextCharacter, 90);
    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion, text]);

  const isComplete = characterCount >= text.length;

  return (
    <p className="agentic-tooltip-copy">
      <span className="sr-only">{text}</span>
      <span className="agentic-tooltip-measure" aria-hidden="true">
        {text}
      </span>
      <span className="agentic-tooltip-typed" aria-hidden="true">
        {text.slice(0, characterCount)}
        {!reducedMotion && (
          <span className={`agentic-tooltip-caret${isComplete ? ' is-complete' : ''}`} />
        )}
      </span>
    </p>
  );
}

export default function AgenticCloud({ terms }: AgenticCloudProps) {
  const cloudRef = useRef<HTMLUListElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const activeTerm = activeIndex === null ? null : terms[activeIndex];

  useEffect(() => setMounted(true), []);

  const updateTooltipPosition = useCallback(() => {
    if (activeIndex === null) return;

    const trigger = triggerRefs.current[activeIndex];
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportPadding = 16;
    const gap = 12;
    const canSitAbove = triggerRect.top - tooltipRect.height - gap >= viewportPadding;
    const placement = canSitAbove ? 'above' : 'below';
    const preferredTop = canSitAbove
      ? triggerRect.top - tooltipRect.height - gap
      : triggerRect.bottom + gap;
    const top = Math.min(
      Math.max(preferredTop, viewportPadding),
      Math.max(viewportPadding, window.innerHeight - tooltipRect.height - viewportPadding),
    );
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const left = Math.min(
      Math.max(triggerCenter - tooltipRect.width / 2, viewportPadding),
      Math.max(viewportPadding, window.innerWidth - tooltipRect.width - viewportPadding),
    );
    const anchorX = Math.min(Math.max(triggerCenter - left, 18), tooltipRect.width - 18);

    setPosition({ top, left, anchorX, placement });
  }, [activeIndex]);

  useLayoutEffect(() => {
    if (!mounted || activeIndex === null) {
      setPosition(null);
      return;
    }

    updateTooltipPosition();
    const animationFrame = window.requestAnimationFrame(updateTooltipPosition);
    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [activeIndex, mounted, updateTooltipPosition]);

  useEffect(() => {
    if (activeIndex === null) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!cloudRef.current?.contains(event.target as Node)) setActiveIndex(null);
    };

    document.addEventListener('pointerdown', closeOnOutsidePress, true);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress, true);
  }, [activeIndex]);

  const activateFromPointer = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch') setActiveIndex(index);
  };

  const deactivateFromPointer = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch' || document.activeElement === event.currentTarget) return;
    setActiveIndex((currentIndex) => (currentIndex === index ? null : currentIndex));
  };

  const tooltipStyle = position
    ? ({
        top: position.top,
        left: position.left,
        '--tooltip-anchor-x': `${position.anchorX}px`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      <ul
        ref={cloudRef}
        className={`agentic-cloud${activeIndex !== null ? ' is-interacting' : ''}`}
        aria-label="Agentic development tools and practices"
      >
        {terms.map((term, index) => {
          const isActive = activeIndex === index;

          return (
            <li className={isActive ? 'is-active' : undefined} key={term.label}>
              <button
                ref={(element) => {
                  triggerRefs.current[index] = element;
                }}
                className="agentic-term"
                type="button"
                aria-describedby={isActive ? tooltipId : undefined}
                onPointerEnter={(event) => activateFromPointer(index, event)}
                onPointerLeave={(event) => deactivateFromPointer(index, event)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() =>
                  setActiveIndex((currentIndex) => (currentIndex === index ? null : currentIndex))
                }
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key !== 'Escape') return;
                  setActiveIndex(null);
                  event.currentTarget.blur();
                }}
              >
                {term.label}
              </button>
            </li>
          );
        })}
      </ul>

      {mounted && activeTerm &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            className="agentic-tooltip"
            data-placement={position?.placement ?? 'above'}
            data-positioned={position ? 'true' : 'false'}
            role="tooltip"
            style={tooltipStyle}
          >
            <span className="agentic-tooltip-category">{activeTerm.category}</span>
            <strong>{activeTerm.label}</strong>
            <TypewriterText key={activeTerm.label} text={activeTerm.description} />
          </div>,
          document.body,
        )}
    </>
  );
}
