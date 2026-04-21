import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CASE_TYPES } from '../types';
import type { Case } from '../types';
import BackArrow from './BackArrow';
import './StatsPage.css';

export default function StatsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'cases'))
      .then((snap) => setCases(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Case[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="stats-page" style={{ background: 'var(--bg)' }}>
        <BackArrow to="/globe" />
        <p className="stats-page__loading">Loading...</p>
      </div>
    );
  }

  const total = cases.length;
  const solved = cases.filter((c) => c.status === 'solved').length;
  const unsolved = total - solved;
  const solvedPct = total ? Math.round((solved / total) * 100) : 0;

  // By type
  const byType = CASE_TYPES.map((type) => ({
    type,
    count: cases.filter((c) => c.type === type).length,
  })).filter((x) => x.count > 0).sort((a, b) => b.count - a.count);
  const maxType = byType[0]?.count || 1;

  // Top countries
  const countryCounts: Record<string, { name: string; count: number }> = {};
  cases.forEach((c) => {
    if (!countryCounts[c.countryCode]) {
      countryCounts[c.countryCode] = { name: c.countryName, count: 0 };
    }
    countryCounts[c.countryCode].count++;
  });
  const topCountries = Object.values(countryCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const maxCountry = topCountries[0]?.count || 1;

  return (
    <div className="stats-page" style={{ background: 'var(--bg)' }}>
      <BackArrow to="/globe" />

      <h1 className="stats-page__title">{t('stats.title')}</h1>

      {/* Overview */}
      <div className="stats-page__overview">
        <div className="stats-card">
          <span className="stats-card__num">{total}</span>
          <span className="stats-card__label">{t('stats.total')}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__num stats-card__num--green">{solved}</span>
          <span className="stats-card__label">{t('stats.solved')}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__num stats-card__num--red">{unsolved}</span>
          <span className="stats-card__label">{t('stats.unsolved')}</span>
        </div>
      </div>

      {/* Solved/Unsolved bar */}
      <div className="stats-section">
        <h2 className="stats-section__title">{t('stats.solvedRatio')}</h2>
        <div className="stats-bar-track">
          <div className="stats-bar-fill stats-bar-fill--green" style={{ width: `${solvedPct}%` }} />
          <div className="stats-bar-fill stats-bar-fill--red" style={{ width: `${100 - solvedPct}%` }} />
        </div>
        <div className="stats-bar-labels">
          <span style={{ color: '#4caf50' }}>{t('cases.solved')} {solvedPct}%</span>
          <span style={{ color: '#f44336' }}>{t('cases.unsolved')} {100 - solvedPct}%</span>
        </div>
      </div>

      {/* By type */}
      <div className="stats-section">
        <h2 className="stats-section__title">{t('stats.byType')}</h2>
        <div className="stats-bars">
          {byType.map(({ type, count }) => (
            <div key={type} className="stats-row">
              <span className="stats-row__label">{t(`types.${type}`)}</span>
              <div className="stats-row__track">
                <div
                  className="stats-row__fill"
                  style={{ width: `${(count / maxType) * 100}%` }}
                />
              </div>
              <span className="stats-row__count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top countries */}
      <div className="stats-section">
        <h2 className="stats-section__title">{t('stats.topCountries')}</h2>
        <div className="stats-bars">
          {topCountries.map(({ name, count }) => (
            <div key={name} className="stats-row">
              <span className="stats-row__label">{name}</span>
              <div className="stats-row__track">
                <div
                  className="stats-row__fill"
                  style={{ width: `${(count / maxCountry) * 100}%` }}
                />
              </div>
              <span className="stats-row__count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
