import { useTranslation } from 'react-i18next';
import './DeleteConfirm.css';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div className="delete-overlay" onClick={onCancel}>
      <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
        <ConfirmContent onConfirm={onConfirm} onCancel={onCancel} />
      </div>
    </div>
  );
}

function ConfirmContent({ onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <p className="delete-dialog__text">{t('cases.confirmDelete')}</p>
      <div className="delete-dialog__actions">
        <button className="delete-dialog__no" onClick={onCancel}>
          {t('cases.no')}
        </button>
        <button className="delete-dialog__yes" onClick={onConfirm}>
          {t('cases.yes')}
        </button>
      </div>
    </>
  );
}
