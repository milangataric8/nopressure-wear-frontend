// Reusable label + input-slot + inline error wrapper for form fields.
// Usage:
// <FormField label={t('address.street')} name="street" error={errors.street}>
//     <input id="street" name="street" ... className={`${inputClass} ${errors.street ? inputError : inputNormal}`} />
// </FormField>
const FormField = ({ label, name, error, required, children }) => (
    <div>
        {label && (
            <label htmlFor={name} className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
        )}
        {children}
        {error && (
            <p id={`${name}-error`} className="text-xs text-red-500 mt-1">
                {error}
            </p>
        )}
    </div>
);

export default FormField;
