import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Case, CaseType } from '../types';
import { CASE_TYPES } from '../types';
import './CaseModal.css';

interface Props {
  initial?: Case;
  onSave: (data: {
    title: string;
    date: string;
    status: 'solved' | 'unsolved';
    type: CaseType;
    description: string;
  }) => void;
  onCancel: () => void;
}

export default function CaseModal({ initial, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initial?.date || '');
  const [status, setStatus] = useState<'solved' | 'unsolved'>(initial?.status || 'unsolved');
  const [type, setType] = useState<CaseType>(initial?.type || 'Sonstiges');
  const [description, setDescription] = useState(initial?.description || '');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), date, status, type, description });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal__field">
          <label>{t('cases.title')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="modal__field">
          <label>{t('cases.date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="modal__field">
          <label>{t('cases.status')}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'solved' | 'unsolved')}>
            <option value="unsolved">{t('cases.unsolved')}</option>
            <option value="solved">{t('cases.solved')}</option>
          </select>
        </div>

        <div className="modal__field">
          <label>{t('cases.type')}</label>
          <select value={type} onChange={(e) => setType(e.target.value as CaseType)}>
            {CASE_TYPES.map((ct) => (
              <option key={ct} value={ct}>
                {t(`types.${ct}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="modal__field">
          <label>{t('cases.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder={t('cases.descriptionHint')}
          />
        </div>

        <div className="modal__actions">
          <button type="button" className="modal__cancel" onClick={onCancel}>
            {t('cases.cancel')}
          </button>
          <button type="submit" className="modal__save">
            {t('cases.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
