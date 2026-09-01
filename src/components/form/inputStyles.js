// Single source of truth for form input classes. Re-exports the values the rest
// of the app (checkout, older admin forms) already use so there's no divergence.
import { inputClass as base, inputNormal, inputError } from '../../utils/validationUtils';

export const inputBase = base;
export { inputNormal, inputError };

export const inputClass = (hasError) => `${inputBase} ${hasError ? inputError : inputNormal}`;
