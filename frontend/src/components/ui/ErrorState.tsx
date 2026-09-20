import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="state-container">
      <AlertCircle size={48} style={{ color: 'var(--color-danger)' }} />
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          Try Again
        </Button>
      )}
    </div>
  );
};
