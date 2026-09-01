// Runs a declarative rule map ({ field: [validator, ...] }) over a values object.
// Stops at the first failing validator per field.

export function validateField(field, values, rules) {
    const validators = rules[field] || [];
    for (const validate of validators) {
        const result = validate(values[field], values);
        if (result) return result;
    }
    return undefined;
}

export function validateForm(values, rules) {
    const errors = {};
    for (const field of Object.keys(rules)) {
        const result = validateField(field, values, rules);
        if (result) errors[field] = result;
    }
    return errors;
}

// Scroll to and focus the first field that has an error. Matches on [name],
// then #id, then #<name>-field (rich-text / file wrappers set the last).
export function focusFirstError(errors) {
    const first = Object.keys(errors || {}).find(k => errors[k]);
    if (!first) return;
    const el =
        document.querySelector(`[name="${first}"]`) ||
        document.getElementById(first) ||
        document.getElementById(`${first}-field`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus?.({ preventScroll: true });
}
