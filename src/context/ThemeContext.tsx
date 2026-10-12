import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('my_market_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // ignore
    }
    // Default to light mode as requested by user
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('my_market_theme', newTheme);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-200 transition-colors duration-200';
    } else {
      root.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-800 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-900 transition-colors duration-200';
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
