import { validatePassword } from '../../utils/passwordUtils';
import { useTranslation } from 'react-i18next';

const PasswordStrength = ({ password }) => {
    const { t } = useTranslation();
    if (!password) return null;
    validatePassword(password);
    const requirements = [
        { label: t('auth.minChars'), met: password.length >= 8 },
        { label: t('auth.oneNumber'), met: /[0-9]/.test(password) },
        { label: t('auth.oneSpecial'), met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
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
