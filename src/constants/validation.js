// Password rules — the single frontend source of truth, mirroring the backend
// @Pattern / @Size on rs.nopressurewear.dto.user.UserUpdateRequest (and the
// matching create/register request). Keep these in lockstep with the backend;
// do not inline the regex in components.

export const PASSWORD_MIN_LENGTH = 8;

// Requires at least one digit AND at least one special character.
export const PASSWORD_PATTERN =
    /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/;
