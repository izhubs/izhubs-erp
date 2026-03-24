'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    // Check if user has previously set a preference or default to light
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed bottom-6 right-6 z-[9999] p-3 rounded-full 
        transition-all duration-300 ease-in-out
        shadow-lg backdrop-blur-md border border-white/20
        ${theme === 'dark' 
          ? 'bg-slate-800/60 text-yellow-300 hover:bg-slate-700/80 shadow-slate-900/50' 
          : 'bg-white/80 text-slate-800 hover:bg-white shadow-slate-200/50'
        }
      `}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
