export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('At least 8 characters');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('At least one number');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('At least one special character');
    }

    return errors;
};

export const isPasswordValid = (password) => {
    return validatePassword(password).length === 0;
};