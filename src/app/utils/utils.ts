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

export const validatePlayerIsOlderThan = ({
  birthday,
  age,
}: {
  birthday: string | string[];
  age: number;
}) => {
  const years = getYears(new Date(String(birthday)));
  if (years < age) {
    return false;
  }
  return true;
};
