import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import type { Case } from '../types';
import './CaseCard.css';

interface Props {
  caseData: Case;
  editMode: boolean;
  deleteMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CaseCard({ caseData, editMode, deleteMode, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <div className="case-card">
      {/* Edit pencil icon */}
      {editMode && (
        <button className="case-card__edit-icon" onClick={onEdit} title={t('cases.edit')}>
          &#9998;
        </button>
      )}

      {/* Delete X icon */}
      {deleteMode && (
        <button className="case-card__delete-icon" onClick={onDelete} title={t('cases.delete')}>
          &times;
        </button>
      )}

      <div className="case-card__header">
        <h3 className="case-card__title">{caseData.title}</h3>
        <span className="case-card__date">{caseData.date}</span>
      </div>

      <div className="case-card__badges">
        <span className={`case-card__badge case-card__badge--${caseData.status}`}>
          {t(`cases.${caseData.status}`)}
        </span>
        <span className="case-card__badge case-card__badge--type">
          {t(`types.${caseData.type}`)}
        </span>
      </div>

      {caseData.description && (
        <div className="case-card__description">
          <ReactMarkdown>{caseData.description}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
