import React from 'react';
import { Dumbbell, Loader2 } from 'lucide-react';

interface InitialAppLoaderProps {
  message?: string;
  subtext?: string;
}

export const InitialAppLoader: React.FC<InitialAppLoaderProps> = ({
  message = 'Connecting to GymManager server...',
  subtext = 'Please wait a moment if the backend is waking up from sleep.',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-neutral-50, #f8fafc)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <Dumbbell size={36} style={{ color: 'var(--color-primary, #1890ff)' }} />
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900, #0f172a)' }}>
          GymManager
        </span>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid var(--color-neutral-200, #e2e8f0)',
        }}
      >
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <Loader2
            size={42}
            style={{
              color: 'var(--color-primary, #1890ff)',
              animation: 'spin 1.2s linear infinite',
            }}
          />
        </div>

        <h3
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--color-neutral-900, #0f172a)',
          }}
        >
          {message}
        </h3>

        {subtext && (
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--color-neutral-500, #64748b)',
              lineHeight: 1.5,
            }}
          >
            {subtext}
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
