import { authenticate, validateCredentials } from './login-logic.js';

const form    = document.getElementById('loginForm');
const emailEl = document.getElementById('email');
const pwdEl   = document.getElementById('password');
const formMsg = document.getElementById('formMsg');

function validate() {
  const emailErr = document.getElementById('emailError');
  const pwdErr   = document.getElementById('pwdError');
  emailErr.textContent = '';
  pwdErr.textContent   = '';
  const errors = validateCredentials(emailEl.value, pwdEl.value);
  emailErr.textContent = errors.email || '';
  pwdErr.textContent = errors.password || '';
  return Object.keys(errors).length === 0;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;
  const validUser = authenticate(emailEl.value, pwdEl.value);
  formMsg.textContent = validUser
    ? '✅ Acceso correcto. Bienvenido/a!'
    : '❌ Credenciales incorrectas.';
  formMsg.style.color = validUser ? 'green' : 'red';
});
