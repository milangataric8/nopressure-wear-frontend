import { validatePassword } from '../../utils/passwordUtils';

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    validatePassword(password);
    const requirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'At least one number', met: /[0-9]/.test(password) },
        { label: 'At least one special character', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
    ];

    return (
        <div className="mt-2 space-y-1">
            {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                    <span className={`text-xs ${req.met ? 'text-green-600' : 'text-red-500'}`}>
                        {req.met ? '✓' : '✗'}
                    </span>
                    <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                        {req.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default PasswordStrength;