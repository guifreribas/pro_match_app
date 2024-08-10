export const getYears = (birthday: Date) => {
  return new Date().getFullYear() - new Date(birthday).getFullYear();
};
