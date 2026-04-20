import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  sunPosition: number;
  onSunChange: (v: number) => void;
  speed: number;
  onSpeedChange: (v: number) => void;
}

export default function GlobeControls({ sunPosition, onSunChange, speed, onSpeedChange }: Props) {
  const { t } = useTranslation();
  const { toggleTheme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      minWidth: 180,
      color: 'var(--fg)',
    }}>
      {/* Sun position slider */}
      <div>
        <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
          {t('globe.sunPosition')}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{t('globe.night')}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sunPosition}
            onChange={(e) => onSunChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--fg)' }}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>{t('globe.day')}</span>
        </div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          background: 'none',
          border: '1px solid var(--fg)',
          color: 'var(--fg)',
          padding: '6px 12px',
          borderRadius: 4,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        {t('globe.invertColors')}
      </button>

      {/* Speed slider */}
      <div>
        <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
          {t('globe.speed')}
        </label>
        <input
          type="range"
          min={0.05}
          max={2}
          step={0.05}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: '100%', marginTop: 6, accentColor: 'var(--fg)' }}
        />
      </div>
    </div>
  );
}
