export const DEMO_USERS = [
  { email: 'alumno@instituto.es', password: 'Alumno123!' }
];

export function validateCredentials(email, password) {
  const errors = {};

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Introduce un correo válido.';
  }

  if (password.length < 8) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
  }

  return errors;
}

export function authenticate(email, password, users = DEMO_USERS) {
  return users.some(user => user.email === email && user.password === password);
}