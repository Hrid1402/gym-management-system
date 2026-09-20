import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
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
        textAlign: 'center',
      }}
    >
      <FileQuestion size={64} style={{ color: 'var(--color-neutral-400)', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--color-neutral-500)', marginBottom: '1.5rem', maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};
