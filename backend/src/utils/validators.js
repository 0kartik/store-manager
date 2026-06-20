// Centralized validators matching the assessment spec exactly.

function validateName(name) {
  if (typeof name !== 'string') return 'Name is required';
  if (name.length < 20 || name.length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return null;
}

function validateAddress(address) {
  if (address && address.length > 400) {
    return 'Address must be at most 400 characters';
  }
  return null;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !re.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

function validateRating(rating) {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return null;
}

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRating,
};
