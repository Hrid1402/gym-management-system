/**
 * Validation Helper Functions in Spanish (Latin America)
 */

export const validateName = (value: string, fieldName = 'El nombre'): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} no puede estar vacío.`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres.`;
  }
  if (value.length > 60) {
    return `${fieldName} no puede exceder los 60 caracteres.`;
  }
  return null;
};

export const validateDni = (value: string): string | null => {
  if (!value || !value.trim()) {
    return 'El DNI / documento es obligatorio.';
  }
  if (value.trim().length < 4) {
    return 'El DNI debe tener al menos 4 caracteres.';
  }
  if (value.trim().length > 20) {
    return 'El DNI no puede exceder los 20 caracteres.';
  }
  return null;
};

export const validateEmail = (value: string): string | null => {
  if (!value || !value.trim()) {
    return 'El correo electrónico es obligatorio.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Ingresa un correo electrónico válido.';
  }
  return null;
};

export const validatePhone = (value: string): string | null => {
  if (!value || !value.trim()) {
    return 'El teléfono es obligatorio.';
  }
  if (value.trim().length < 6) {
    return 'Ingresa un teléfono válido (mínimo 6 dígitos).';
  }
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) {
    return 'La contraseña es obligatoria.';
  }
  if (value.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Por favor confirma la contraseña.';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
};

export const validatePrice = (value: number | string): string | null => {
  if (value === '' || value === undefined || value === null) {
    return 'El precio es obligatorio.';
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return 'El precio debe ser un valor numérico positivo mayor a 0.';
  }
  return null;
};

export const validateDurationDays = (value: number | string): string | null => {
  if (value === '' || value === undefined || value === null) {
    return 'La duración es obligatoria.';
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return 'La duración debe ser un número entero de al menos 1 día.';
  }
  return null;
};
