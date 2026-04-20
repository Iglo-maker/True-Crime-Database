import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import SplashPage from './components/SplashPage';
import GlobePage from './components/GlobePage';
import CountryPage from './components/CountryPage';
import CasesPage from './components/CasesPage';
import AdminDashboard from './components/AdminDashboard';
import UserBadge from './components/UserBadge';
import LanguageSwitch from './components/LanguageSwitch';

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/globe" element={<GlobePage />} />
            <Route path="/country/:countryCode" element={<CountryPage />} />
            <Route path="/country/:countryCode/state/:stateCode" element={<CasesPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <UserBadge />
          <LanguageSwitch />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
