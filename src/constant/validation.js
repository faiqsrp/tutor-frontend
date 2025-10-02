export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{4,}\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email)
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+?\d{1,4}[-.\s]?)?\d{10,15}$/;
  return phoneRegex.test(phone);
};