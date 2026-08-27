import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '#profile', label: 'Profile' },
  { href: '#agentic', label: 'Agentic' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <div className="mobile-menu-root">
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="menu-toggle-label" aria-hidden="true">
          <span className="menu-toggle-label-menu">Menu</span>
          <span className="menu-toggle-label-close">Close</span>
        </span>
        <span className="menu-toggle-mark" aria-hidden="true">
          <span className="menu-toggle-icon">
            <span></span>
            <span></span>
          </span>
        </span>
      </button>

      <div
        className={`mobile-menu-panel${open ? ' is-open' : ''}`}
        id="mobile-menu-panel"
        aria-hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={open ? undefined : -1}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <a
          className="mobile-menu-email"
          href="mailto:marc.andersson.new@gmail.com"
          tabIndex={open ? undefined : -1}
        >
          marc.andersson.new@gmail.com
        </a>
      </div>
    </div>
  );
}
