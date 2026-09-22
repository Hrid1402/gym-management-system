import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Cargando...' }) => {
  return (
    <div className="state-container">
      <Loader2 size={36} className="state-icon" style={{ animation: 'spin 1.2s linear infinite', color: 'var(--color-primary)' }} />
      <p className="state-title">{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
