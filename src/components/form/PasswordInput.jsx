import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Password field with a per-instance show/hide toggle. Drop-in for a plain <input>
// inside FormField — takes all input props through, keeps its own `visible` state.
export default function PasswordInput({ className = '', wrapperClassName = '', ...props }) {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();

    return (
        <div className={`relative ${wrapperClassName}`}>
            <input
                {...props}
                type={visible ? 'text' : 'password'}
                // pr-12 appended AFTER the caller's className so it can't be overridden away
                className={`${className} pr-12`}
            />
            <button
                type="button"          /* default is submit — a click here must not send the form */
                onClick={() => setVisible(v => !v)}
                tabIndex={-1}           /* Tab skips the icon and goes to the next field */
                aria-label={visible ? t('password.hide') : t('password.show')}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-black"
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
