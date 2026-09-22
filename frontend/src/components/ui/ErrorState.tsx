import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Algo salió mal',
  message = 'No se pudieron cargar los datos. Por favor, intenta de nuevo.',
  onRetry,
}) => {
  return (
    <div className="state-container">
      <AlertCircle size={48} style={{ color: 'var(--color-danger)' }} />
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          Intentar de nuevo
        </Button>
      )}
    </div>
  );
};
