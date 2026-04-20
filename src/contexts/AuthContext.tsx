import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getSavedMember, saveMember, logout as doLogout, type Member } from '../firebase/auth';

interface AuthContextType {
  member: Member | null;
  login: (member: Member) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  member: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);

  // Restore saved session on mount
  useEffect(() => {
    const saved = getSavedMember();
    if (saved) setMember(saved);
  }, []);

  const login = useCallback((m: Member) => {
    setMember(m);
    saveMember(m);
  }, []);

  const logout = useCallback(() => {
    setMember(null);
    doLogout();
  }, []);

  return (
    <AuthContext.Provider value={{ member, login, logout, isAdmin: member?.isAdmin ?? false }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
