import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitSuggestion } from '../firebase/suggestions';
import './SuggestionModal.css';

interface Props {
  countryCode: string;
  countryName: string;
  onClose: () => void;
}

export default function SuggestionModal({ countryCode, countryName, onClose }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await submitSuggestion({ countryCode, countryName, caseTitle: title.trim() });
      setSent(true);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="suggestion-overlay" onClick={onClose}>
      <div className="suggestion-modal" onClick={(e) => e.stopPropagation()}>
        <button className="suggestion-modal__close" onClick={onClose}>✕</button>

        <h2 className="suggestion-modal__title">{t('suggestion.title')}</h2>
        <p className="suggestion-modal__sub">{countryName}</p>

        {sent ? (
          <div className="suggestion-modal__success">
            <span>✓</span>
            <p>{t('suggestion.sent')}</p>
            <button className="suggestion-modal__btn" onClick={onClose}>
              {t('suggestion.close')}
            </button>
          </div>
        ) : (
          <>
            <p className="suggestion-modal__hint">{t('suggestion.hint')}</p>
            <input
              className="suggestion-modal__input"
              type="text"
              placeholder={t('suggestion.placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
              maxLength={120}
            />
            <div className="suggestion-modal__actions">
              <button className="suggestion-modal__btn suggestion-modal__btn--ghost" onClick={onClose}>
                {t('suggestion.cancel')}
              </button>
              <button
                className="suggestion-modal__btn"
                onClick={handleSubmit}
                disabled={!title.trim() || loading}
              >
                {loading ? '...' : t('suggestion.submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
