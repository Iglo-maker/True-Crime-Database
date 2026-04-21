import { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  inverted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ inverted: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ inverted: false }}>
      <div style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
