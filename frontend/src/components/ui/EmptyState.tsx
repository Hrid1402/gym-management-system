import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no records to display at this moment.',
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
