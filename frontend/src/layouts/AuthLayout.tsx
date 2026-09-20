import React from 'react';
import { Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-neutral-100)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Dumbbell size={24} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Gym Management System
        </h1>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: 'var(--shadow-md)',
          padding: '2rem',
        }}
      >
        <Outlet />
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
        Gym Management System
      </p>
    </div>
  );
};
