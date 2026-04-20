import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

export default function UserBadge() {
  const { member, logout, isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!member) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          style={{
            position: 'fixed',
            top: 16,
            right: 20,
            background: 'none',
            border: '1px solid var(--fg-muted)',
            color: 'var(--fg-muted)',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 12,
            zIndex: 200,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--fg)';
            e.currentTarget.style.color = 'var(--fg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--fg-muted)';
            e.currentTarget.style.color = 'var(--fg-muted)';
          }}
        >
          {t('auth.login')}
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <div ref={ref} style={{ position: 'fixed', top: 16, right: 20, zIndex: 200 }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: '1px solid var(--fg)',
          color: 'var(--fg)',
          padding: '4px 14px',
          borderRadius: 4,
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: 0.5,
        }}
      >
        {member.name}
      </button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            background: 'var(--modal-bg)',
            border: '1px solid var(--fg-muted)',
            borderRadius: 4,
            overflow: 'hidden',
            minWidth: 140,
          }}
        >
          {isAdmin && (
            <button
              onClick={() => { setShowDropdown(false); navigate('/admin'); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 14px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--fg)',
                fontSize: 13,
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => { setShowDropdown(false); logout(); }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 14px',
              background: 'none',
              border: 'none',
              color: 'var(--fg-muted)',
              fontSize: 13,
              textAlign: 'left',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
