import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getAllMembers, setMemberActive, type MemberDoc } from '../firebase/members';
import { getRecentActivity, type ActivityEntry } from '../firebase/activity';
import { getSuggestions, type Suggestion } from '../firebase/suggestions';
import BackArrow from './BackArrow';
import './AdminDashboard.css';

function timeAgo(timestamp: any, t: any): string {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('admin.justNow');
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [members, setMembers] = useState<MemberDoc[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'suggestions'>('members');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  async function loadData() {
    setLoading(true);
    try {
      const [m, a, s] = await Promise.all([getAllMembers(), getRecentActivity(), getSuggestions()]);
      setMembers(m);
      setActivity(a);
      setSuggestions(s);
    } catch {
      // Firestore not configured
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(name: string, current: boolean) {
    // Optimistic update
    setMembers((prev) =>
      prev.map((m) => (m.name === name ? { ...m, active: !current } : m))
    );
    try {
      await setMemberActive(name, !current);
    } catch (err) {
      // Revert on failure
      setMembers((prev) =>
        prev.map((m) => (m.name === name ? { ...m, active: current } : m))
      );
      console.error('Toggle failed:', err);
    }
  }

  const actionLabel = (action: string) => {
    switch (action) {
      case 'add': return t('admin.added');
      case 'edit': return t('admin.edited');
      case 'delete': return t('admin.deleted');
      default: return action;
    }
  };

  return (
    <div className="admin" style={{ background: 'var(--bg)' }}>
      <BackArrow to="/globe" />

      <h1 className="admin__title">Dashboard</h1>

      <div className="admin__tabs">
        {(['members', 'activity', 'suggestions'] as const).map((tab) => (
          <button
            key={tab}
            className={`admin__tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`admin.tab_${tab}`)}
            {tab === 'suggestions' && suggestions.length > 0 && (
              <span className="admin__tab-badge">{suggestions.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p className="admin__loading">Loading...</p>}

      {!loading && (
        <>
          {/* Members table */}
          <section className="admin__section" style={{ display: activeTab === 'members' ? 'block' : 'none' }}>
            <h2 className="admin__section-title">{t('admin.members')}</h2>
            <div className="admin__table">
              <div className="admin__row admin__row--header">
                <span>{t('admin.name')}</span>
                <span>{t('admin.lastOnline')}</span>
                <span>{t('admin.status')}</span>
              </div>
              {members
                .filter((m) => !m.isAdmin)
                .map((m) => (
                  <div key={m.name} className="admin__row">
                    <span className="admin__member-name">{m.name}</span>
                    <span className="admin__member-time">
                      {timeAgo(m.lastOnline, t)}
                    </span>
                    <label className="admin__switch">
                      <input
                        type="checkbox"
                        checked={m.active}
                        onChange={() => toggleActive(m.name, m.active)}
                      />
                      <span className="admin__slider" />
                    </label>
                  </div>
                ))}
            </div>
          </section>

          {/* Activity log */}
          <section className="admin__section" style={{ display: activeTab === 'activity' ? 'block' : 'none' }}>
            <h2 className="admin__section-title">{t('admin.recentActivity')}</h2>
            <div className="admin__activity">
              {activity.length === 0 && (
                <p className="admin__empty">{t('admin.noActivity')}</p>
              )}
              {activity.map((a) => (
                <div key={a.id} className="admin__activity-item">
                  <span className="admin__activity-user">[{a.user}]</span>{' '}
                  {actionLabel(a.action)}{' '}
                  <span className="admin__activity-case">"{a.caseTitle}"</span>{' '}
                  <span className="admin__activity-loc">
                    {a.countryCode}-{a.stateCode}
                  </span>
                  <span className="admin__activity-time">
                    {timeAgo(a.timestamp, t)}
                  </span>
                </div>
              ))}
            </div>
          </section>
          {/* Suggestions */}
          <section className="admin__section" style={{ display: activeTab === 'suggestions' ? 'block' : 'none' }}>
            <h2 className="admin__section-title">{t('admin.tab_suggestions')}</h2>
            <div className="admin__activity">
              {suggestions.length === 0 && (
                <p className="admin__empty">{t('admin.noSuggestions')}</p>
              )}
              {suggestions.map((s) => (
                <div key={s.id} className="admin__activity-item">
                  <span className="admin__activity-case">"{s.caseTitle}"</span>{' '}
                  <span className="admin__activity-loc">{s.countryName}</span>
                  <span className="admin__activity-time">
                    {timeAgo(s.submittedAt, t)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
