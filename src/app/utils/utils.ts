import { AbstractControl, ValidationErrors } from '@angular/forms';

export const getYears = (birthday: Date) => {
  return new Date().getFullYear() - new Date(birthday).getFullYear();
};

export const validateDni = (
  control: AbstractControl
): ValidationErrors | null => {
  const dni = control.value;
  const dniRegex = /^[XYZ\d]\d{7}[A-Z]$/;
  if (!dniRegex.test(dni)) {
    return { dni: true };
  }
  return null;
};

export function urlParser(params = {}, baseUrl = '') {
  if (!params) return baseUrl;
  const urlParams = new URLSearchParams(params);
  const fullUrl = `${baseUrl}?${urlParams.toString()}`;
  return fullUrl;
}
