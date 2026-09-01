import { useState } from 'react';
import { validateForm, validateField, focusFirstError } from '../utils/validateForm';

// Wraps the touched / blur / change / submit validation pattern so each form
// doesn't re-implement it. `rules` may be a plain rule map, or a function of the
// current values (for create-vs-edit differences).
//
//   const f = useFormValidation(initialValues, () => ({ email: [required, email] }));
//   <input name="email" value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur} />
//   f.errors.email  ->  pass to <FormField error={...}>
//
// On submit: if (!f.submit()) return;   // validates all, focuses first error
export function useFormValidation(initialValues, rules) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const rulesFor = (v) => (typeof rules === 'function' ? rules(v) : rules);

    const revalidate = (name, nextValues) => {
        setErrors(prev => ({ ...prev, [name]: validateField(name, nextValues, rulesFor(nextValues)) }));
    };

    const setFieldValue = (name, value) => {
        setValues(prev => {
            const next = { ...prev, [name]: value };
            if (touched[name]) revalidate(name, next);
            return next;
        });
    };

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFieldValue(name, type === 'checkbox' ? checked : value);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, values, rulesFor(values)) }));
    };

    // Validate everything, mark all fields touched, focus the first error.
    // Returns true when the form is valid.
    const submit = () => {
        const activeRules = rulesFor(values);
        const found = validateForm(values, activeRules);
        setErrors(found);
        setTouched(Object.fromEntries(Object.keys(activeRules).map(k => [k, true])));
        if (Object.keys(found).length > 0) {
            focusFirstError(found);
            return false;
        }
        return true;
    };

    // Merge server-side field errors (already plain text) into the same state.
    const applyServerErrors = (fieldErrors) => {
        if (!fieldErrors || Object.keys(fieldErrors).length === 0) return false;
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        setTouched(prev => ({ ...prev, ...Object.fromEntries(Object.keys(fieldErrors).map(k => [k, true])) }));
        focusFirstError(fieldErrors);
        return true;
    };

    const reset = (next = initialValues) => {
        setValues(next);
        setErrors({});
        setTouched({});
    };

    return {
        values, setValues, errors, setErrors, touched,
        handleChange, handleBlur, setFieldValue,
        submit, applyServerErrors, reset,
    };
}
