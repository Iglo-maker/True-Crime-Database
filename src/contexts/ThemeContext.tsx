import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ThemeContextType {
  inverted: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  inverted: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [inverted, setInverted] = useState(false);

  const toggleTheme = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ inverted, toggleTheme }}>
      <div className={inverted ? 'theme-inverted' : ''} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
