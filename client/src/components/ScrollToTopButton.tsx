import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const { pathname } = useLocation();

  // Scroll to top automatically when navigating to any page / product
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 250;
      setVisible((prev) => (prev !== isScrolled ? isScrolled : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-20 md:bottom-8 right-5 sm:right-8 z-40 w-12 h-12 rounded-full bg-white text-slate-900 border border-slate-200/90 shadow-xl shadow-slate-900/15 flex items-center justify-center hover:bg-slate-50 hover:shadow-2xl active:scale-95 cursor-pointer transition-all duration-300 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
};
