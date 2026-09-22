import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No se encontraron elementos',
  description = 'No hay registros disponibles en este momento.',
  action,
}) => {
  return (
    <div className="state-container">
      <Inbox size={48} className="state-icon" />
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{description}</p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
};
