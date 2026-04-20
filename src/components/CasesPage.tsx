import { useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCases } from '../hooks/useCases';
import { addCase, updateCase, deleteCase } from '../firebase/cases';
import { logActivity } from '../firebase/activity';
import type { Case, CaseType } from '../types';
import BackArrow from './BackArrow';
import CaseCard from './CaseCard';
import CaseModal from './CaseModal';
import DeleteConfirm from './DeleteConfirm';
import './CasesPage.css';

export default function CasesPage() {
  const { countryCode, stateCode } = useParams<{ countryCode: string; stateCode: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const { member } = useAuth();

  const countryName = (location.state as any)?.countryName || countryCode || '';
  const stateName = (location.state as any)?.stateName || stateCode || '';

  const { cases, loading, reload } = useCases(countryCode || '', stateCode || '');

  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deletingCase, setDeletingCase] = useState<Case | null>(null);

  const handleAdd = useCallback(
    async (data: { title: string; date: string; status: 'solved' | 'unsolved'; type: CaseType; description: string }) => {
      if (!member || !countryCode || !stateCode) return;
      await addCase({
        ...data,
        countryCode,
        countryName,
        stateCode,
        stateName,
        createdBy: member.name,
      });
      await logActivity({
        user: member.name,
        action: 'add',
        caseTitle: data.title,
        countryCode,
        stateCode,
      });
      setShowAddModal(false);
      reload();
    },
    [member, countryCode, stateCode, countryName, stateName, reload]
  );

  const handleUpdate = useCallback(
    async (data: { title: string; date: string; status: 'solved' | 'unsolved'; type: CaseType; description: string }) => {
      if (!editingCase || !member) return;
      await updateCase(editingCase.id, data);
      await logActivity({
        user: member.name,
        action: 'edit',
        caseTitle: data.title,
        countryCode: countryCode || '',
        stateCode: stateCode || '',
      });
      setEditingCase(null);
      setEditMode(false);
      reload();
    },
    [editingCase, member, countryCode, stateCode, reload]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingCase || !member) return;
    await deleteCase(deletingCase.id);
    await logActivity({
      user: member.name,
      action: 'delete',
      caseTitle: deletingCase.title,
      countryCode: countryCode || '',
      stateCode: stateCode || '',
    });
    setDeletingCase(null);
    setDeleteMode(false);
    reload();
  }, [deletingCase, member, countryCode, stateCode, reload]);

  return (
    <div className="cases-page" style={{ background: 'var(--bg)' }}>
      <BackArrow to="/" />

      {/* Header */}
      <div className="cases-page__header">
        <h1 className="cases-page__title">
          {t('cases.casesIn')} {stateCode === 'ALL' ? countryName : stateName}
        </h1>
        {stateCode !== 'ALL' && <p className="cases-page__subtitle">{countryName}</p>}
      </div>

      {/* Action buttons - only shown when logged in */}
      {member && (
        <div className="cases-page__actions">
          <button
            className={`cases-page__action-btn ${editMode ? 'active' : ''}`}
            onClick={() => { setEditMode(!editMode); setDeleteMode(false); }}
          >
            {t('cases.edit')}
          </button>
          <button
            className="cases-page__action-btn"
            onClick={() => setShowAddModal(true)}
          >
            {t('cases.add')}
          </button>
          <button
            className={`cases-page__action-btn ${deleteMode ? 'active' : ''}`}
            onClick={() => { setDeleteMode(!deleteMode); setEditMode(false); }}
          >
            {t('cases.delete')}
          </button>
        </div>
      )}

      {/* Cases list */}
      <div className="cases-page__list">
        {loading && <p className="cases-page__empty">Loading...</p>}
        {!loading && cases.length === 0 && (
          <p className="cases-page__empty">{t('cases.noCases')}</p>
        )}
        {cases.map((c) => (
          <CaseCard
            key={c.id}
            caseData={c}
            editMode={editMode}
            deleteMode={deleteMode}
            onEdit={() => setEditingCase(c)}
            onDelete={() => setDeletingCase(c)}
          />
        ))}
      </div>

      {/* Modals */}
      {showAddModal && (
        <CaseModal onSave={handleAdd} onCancel={() => setShowAddModal(false)} />
      )}

      {editingCase && (
        <CaseModal
          initial={editingCase}
          onSave={handleUpdate}
          onCancel={() => { setEditingCase(null); setEditMode(false); }}
        />
      )}

      {deletingCase && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => { setDeletingCase(null); setDeleteMode(false); }}
        />
      )}
    </div>
  );
}
