import { useState, useEffect } from 'react';

const NAV_ITEMS = ['home', 'about', 'projects', 'certifications', 'contact'];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const OFFSET = 120; // px — accounts for sticky nav height + buffer

    const getActive = () => {
      // If the user has scrolled to (or very near) the bottom, activate the last section
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (scrolledToBottom) {
        return NAV_ITEMS[NAV_ITEMS.length - 1];
      }

      // Iterate sections in reverse so the last one above the offset wins
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const id = NAV_ITEMS[i];
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= OFFSET) {
          return id;
        }
      }
      // Default to first item if none are past the offset
      return NAV_ITEMS[0];
    };

    const handleScroll = () => {
      setActiveSection(getActive());
    };

    // Run once on mount to set correct initial active item
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item: string) => {
    setActiveSection(item);
    setIsOpen(false);
  };

  const itemClass = (item: string) => {
    const isActive = activeSection === item;
    return isActive
      ? 'text-[var(--accent-blue)] underline underline-offset-2 transition-all duration-200 cursor-pointer'
      : 'text-[var(--syntax-string)] hover:text-[var(--accent-blue)] hover:underline transition-all duration-200 cursor-pointer';
  };

  return (
    <nav className="sticky top-6 z-50 max-w-6xl w-full mx-auto px-4">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-4 transition-all duration-300">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <a
            href="#home"
            onClick={() => handleNavClick('home')}
            className="font-sans font-bold text-xl text-[var(--text-primary)] tracking-tight hover:text-[var(--accent-blue)] transition-colors"
          >
            Joshua.
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center font-mono text-sm select-none">
            <span className="text-[var(--syntax-keyword)]">const</span>
            &nbsp;
            <span className="text-[var(--syntax-key)]">nav</span>
            &nbsp;
            <span className="text-[var(--text-primary)]">=</span>
            &nbsp;
            <span className="text-yellow-500 font-bold">[</span>
            &nbsp;
            {NAV_ITEMS.map((item, index) => (
              <span key={item}>
                <a
                  href={`#${item}`}
                  onClick={() => handleNavClick(item)}
                  className={itemClass(item)}
                >
                  '{item}'
                </a>
                {index < NAV_ITEMS.length - 1 && (
                  <span className="text-[var(--text-secondary)]">,&nbsp;</span>
                )}
              </span>
            ))}
            &nbsp;
            <span className="text-yellow-500 font-bold">]</span>
            <span className="text-[var(--text-secondary)]">;</span>
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center font-mono text-sm select-none gap-1">
            <span className="text-[var(--syntax-keyword)]">const</span>
            <span className="text-[var(--syntax-key)]">&nbsp;nav</span>
            <span className="text-[var(--text-secondary)]">&nbsp;=&nbsp;</span>
            <span className="text-yellow-500 font-bold">[&nbsp;</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] ${
                isOpen
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-card-inset)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              ...
            </button>
            <span className="text-yellow-500 font-bold">&nbsp;]</span>
            <span className="text-[var(--text-secondary)]">;</span>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[var(--border-subtle)] font-mono text-sm flex gap-4 animate-fadeIn">
            {/* Line numbers */}
            <div className="flex flex-col text-right select-none text-[var(--text-secondary)] opacity-40 border-r border-[var(--border-subtle)] pr-3 min-w-[20px]">
              {Array.from({ length: NAV_ITEMS.length + 2 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            {/* Code */}
            <div className="flex-1 leading-relaxed">
              <div>
                <span className="text-[var(--syntax-keyword)]">const</span>{' '}
                <span className="text-[var(--syntax-key)]">nav</span>{' '}
                <span className="text-[var(--text-secondary)]">=</span>{' '}
                <span className="text-yellow-500 font-bold">[</span>
              </div>
              {NAV_ITEMS.map((item, index) => (
                <div key={item} className="pl-4 flex items-center gap-1.5">
                  {activeSection === item && (
                    <span className="text-[var(--accent-blue)] text-xs leading-none">▶</span>
                  )}
                  <a
                    href={`#${item}`}
                    onClick={() => handleNavClick(item)}
                    className={itemClass(item)}
                  >
                    '{item}'
                  </a>
                  {index < NAV_ITEMS.length - 1 && (
                    <span className="text-[var(--text-secondary)]">,</span>
                  )}
                </div>
              ))}
              <div>
                <span className="text-yellow-500 font-bold">]</span>
                <span className="text-[var(--text-secondary)]">;</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
