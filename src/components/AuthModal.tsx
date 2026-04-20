import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loginWithCode } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import './CaseModal.css';

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const member = await loginWithCode(code.trim());
      login(member);
      onClose();
    } catch (err: any) {
      if (err.message === 'invalid_code') {
        setError(t('auth.invalidCode'));
      } else if (err.message === 'account_disabled') {
        setError(t('auth.accountDisabled'));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--fg)', letterSpacing: 1 }}>
            {t('auth.enterCode')}
          </span>
        </div>

        <div className="modal__field">
          <label>{t('auth.accessCode')}</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
            placeholder="••••••••••••••••••••"
            style={{ fontFamily: 'monospace', letterSpacing: 2 }}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 12, textAlign: 'center' }}>{error}</p>
        )}

        <div className="modal__actions">
          <button type="button" className="modal__cancel" onClick={onClose}>
            {t('cases.cancel')}
          </button>
          <button type="submit" className="modal__save" disabled={loading}>
            {loading ? '...' : t('auth.login')}
          </button>
        </div>
      </form>
    </div>
  );
}
