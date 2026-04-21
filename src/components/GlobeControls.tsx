import { useTranslation } from 'react-i18next';

interface Props {
  sunPosition: number;
  onSunChange: (v: number) => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  heatmap: boolean;
  onHeatmapToggle: () => void;
}

export default function GlobeControls({ sunPosition, onSunChange, speed, onSpeedChange, heatmap, onHeatmapToggle }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 180, color: 'var(--fg)' }}>

      {/* Sun position slider */}
      <div>
        <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
          {t('globe.sunPosition')}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{t('globe.night')}</span>
          <input
            type="range" min={0} max={1} step={0.01} value={sunPosition}
            onChange={(e) => onSunChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--fg)' }}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>{t('globe.day')}</span>
        </div>
      </div>

      {/* Heatmap toggle */}
      <button
        onClick={onHeatmapToggle}
        style={{
          background: heatmap ? 'rgba(255,80,80,0.2)' : 'none',
          border: `1px solid ${heatmap ? '#ff5050' : 'var(--fg)'}`,
          color: heatmap ? '#ff5050' : 'var(--fg)',
          padding: '6px 12px',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        🌡 {t('globe.heatmap')}
      </button>

      {/* Speed slider */}
      <div>
        <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
          {t('globe.speed')}
        </label>
        <input
          type="range" min={0.05} max={2} step={0.05} value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: '100%', marginTop: 6, accentColor: 'var(--fg)' }}
        />
      </div>
    </div>
  );
}
