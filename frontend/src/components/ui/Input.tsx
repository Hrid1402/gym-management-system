import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label} {props.required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`form-control ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {error && <span className="form-error">{error}</span>}
        {helperText && !error && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
