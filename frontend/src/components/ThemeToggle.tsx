import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const stored = localStorage.getItem('ahp-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ahp-theme', theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle light/dark theme"
    >
      {theme === 'dark' ? '\u2600\ufe0f Light' : '\ud83c\udf19 Dark'}
    </button>
  );
}
