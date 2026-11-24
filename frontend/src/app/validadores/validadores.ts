import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validaciones de seguridad de la contraseña (además de minlength y maxlength):
 *  - al menos una mayúscula
 *  - al menos una minúscula
 *  - al menos un número
 *  - al menos un carácter especial
 *  - sin espacios
 */
export function passwordSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    if (!valor) return null; // "required" se encarga del vacío
    const errores: ValidationErrors = {};
    if (!/[A-ZÁÉÍÓÚÑ]/.test(valor)) errores['sinMayuscula'] = true;
    if (!/[a-záéíóúñ]/.test(valor)) errores['sinMinuscula'] = true;
    if (!/\d/.test(valor)) errores['sinNumero'] = true;
    if (!/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(valor)) errores['sinEspecial'] = true;
    if (/\s/.test(valor)) errores['conEspacios'] = true;
    return Object.keys(errores).length ? errores : null;
  };
}

/** Valida en el grupo que dos campos tengan el mismo valor (contraseña y confirmación). */
export function camposIguales(campo: string, confirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const a = grupo.get(campo)?.value;
    const b = grupo.get(confirmacion);
    if (!b) return null;
    const errores = { ...(b.errors ?? {}) };
    if (a && b.value && a !== b.value) {
      errores['noCoinciden'] = true;
    } else {
      delete errores['noCoinciden'];
    }
    b.setErrors(Object.keys(errores).length ? errores : null);
    return null;
  };
}

/** Rechaza textos formados solo por espacios. */
export function noSoloEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0
      ? { soloEspacios: true } : null;
  };
}

/** Edad mínima a partir de una fecha de nacimiento (yyyy-mm-dd). */
export function edadMinima(anios: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const nacimiento = new Date(control.value + 'T00:00:00');
    if (isNaN(nacimiento.getTime())) return { fechaInvalida: true };
    const hoy = new Date();
    if (nacimiento > hoy) return { fechaFutura: true };
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad < anios ? { edadMinima: { requerida: anios, actual: edad } } : null;
  };
}

/** Traduce los errores de un control a mensajes para mostrar bajo el campo. */
export function mensajesError(control: AbstractControl | null): string[] {
  if (!control || !control.errors || !(control.touched || control.dirty)) return [];
  const e = control.errors;
  const m: string[] = [];
  if (e['required']) m.push('Este campo es obligatorio.');
  if (e['requiredTrue']) m.push('Debes aceptar para continuar.');
  if (e['email']) m.push('Ingresa un correo válido (ej: nombre@dominio.cl).');
  if (e['minlength']) m.push(`Debe tener al menos ${e['minlength'].requiredLength} caracteres.`);
  if (e['maxlength']) m.push(`Debe tener como máximo ${e['maxlength'].requiredLength} caracteres.`);
  if (e['pattern']) m.push('El formato no es válido.');
  if (e['sinMayuscula']) m.push('Debe incluir al menos una letra mayúscula.');
  if (e['sinMinuscula']) m.push('Debe incluir al menos una letra minúscula.');
  if (e['sinNumero']) m.push('Debe incluir al menos un número.');
  if (e['sinEspecial']) m.push('Debe incluir al menos un carácter especial (ej: # $ % & ! ?).');
  if (e['conEspacios']) m.push('No puede contener espacios.');
  if (e['noCoinciden']) m.push('Las contraseñas no coinciden.');
  if (e['soloEspacios']) m.push('No puede contener solo espacios.');
  if (e['fechaInvalida']) m.push('La fecha no es válida.');
  if (e['fechaFutura']) m.push('La fecha no puede ser futura.');
  if (e['edadMinima']) m.push(`Debes tener al menos ${e['edadMinima'].requerida} años.`);
  return m;
}
