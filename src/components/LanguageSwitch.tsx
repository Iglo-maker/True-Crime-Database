import { useTranslation } from 'react-i18next';

export default function LanguageSwitch() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <button
      onClick={() => i18n.changeLanguage(lang === 'de' ? 'en' : 'de')}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        background: 'none',
        border: '1px solid var(--fg)',
        color: 'var(--fg)',
        padding: '4px 10px',
        fontSize: 12,
        borderRadius: 4,
        zIndex: 200,
        opacity: 0.7,
        transition: 'opacity 0.2s',
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
    >
      {lang === 'de' ? 'EN' : 'DE'}
    </button>
  );
}
