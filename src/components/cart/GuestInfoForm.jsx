import { useTranslation } from 'react-i18next';
import { inputClass, inputNormal, inputError } from '../../utils/validationUtils';

const GuestInfoForm = ({ guestInfo, setGuestInfo, errors = {}, setErrors }) => {
    const { t } = useTranslation();

    const handleChange = (field) => (e) => {
        const { value } = e.target;
        setGuestInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field] && setErrors) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="border border-gray-200 p-6 mb-6">
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                {t('cart.yourInformation')}
            </h3>
            <div className="space-y-3">
                <div>
                    <input
                        type="text"
                        value={guestInfo.fullName}
                        onChange={handleChange('fullName')}
                        placeholder={t('cart.fullName')}
                        aria-invalid={!!errors.fullName}
                        className={`${inputClass} ${errors.fullName ? inputError : inputNormal}`}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <input
                        type="email"
                        value={guestInfo.email}
                        onChange={handleChange('email')}
                        placeholder={t('cart.email')}
                        aria-invalid={!!errors.email}
                        className={`${inputClass} ${errors.email ? inputError : inputNormal}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={handleChange('phone')}
                        placeholder={t('cart.phone')}
                        aria-invalid={!!errors.phone}
                        className={`${inputClass} ${errors.phone ? inputError : inputNormal}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
            </div>
        </div>
    );
};

export default GuestInfoForm;
