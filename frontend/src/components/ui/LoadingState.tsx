import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="state-container">
      <div className="spinner" style={{ fontSize: '2rem' }}>⏳</div>
      <p className="state-title">{message}</p>
    </div>
  );
};
