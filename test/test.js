import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { authenticate, validateCredentials } from '../js/login-logic.js';

describe('validateCredentials', () => {
  it('acepta un correo y contraseña válidos', () => {
    assert.deepEqual(validateCredentials('persona@example.com', 'Password1'), {});
  });

  it('rechaza un correo con formato incorrecto', () => {
    const errors = validateCredentials('correo-invalido', 'Password1');

    assert.equal(errors.email, 'Introduce un correo válido.');
  });

  it('rechaza contraseñas de menos de ocho caracteres', () => {
    const errors = validateCredentials('persona@example.com', 'corta');

    assert.equal(errors.password, 'La contraseña debe tener mínimo 8 caracteres.');
  });
});

describe('authenticate', () => {
  it('acepta las credenciales de demostración', () => {
    assert.equal(authenticate('alumno@instituto.es', 'Alumno123!'), true);
  });

  it('rechaza credenciales incorrectas', () => {
    assert.equal(authenticate('alumno@instituto.es', 'incorrecta'), false);
  });
});