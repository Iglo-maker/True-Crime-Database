import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashPage.css';

export default function SplashPage() {
  const [opening, setOpening] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setOpening(true);
    setTimeout(() => navigate('/globe'), 800);
  };

  return (
    <div className={`splash ${opening ? 'splash--opening' : ''}`}>
      <div className="splash__top" />
      <div className="splash__bottom" />
      <div className="splash__content">
        <button className="splash__circle" onClick={handleClick}>
          <span className="splash__letter">T</span>
        </button>
      </div>
    </div>
  );
}
