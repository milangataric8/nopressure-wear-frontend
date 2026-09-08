import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PasswordInput({ className = '', wrapperClassName = '', ...props }) {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();

    return (
        <div className={`relative ${wrapperClassName}`}>
            <input
                {...props}
                type={visible ? 'text' : 'password'}
                className={`${className} pr-12`}
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                tabIndex={-1}
                aria-label={visible ? t('password.hide') : t('password.show')}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-black"
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
