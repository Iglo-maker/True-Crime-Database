import { useNavigate } from 'react-router-dom';

export default function BackArrow({ to }: { to?: string }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'none',
        border: 'none',
        color: 'var(--fg)',
        fontSize: 28,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        opacity: 0.8,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      aria-label="Back"
    >
      &#8592;
    </button>
  );
}
