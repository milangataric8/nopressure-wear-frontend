import { useTranslation } from 'react-i18next';
import FormField from '../form/FormField';
import { inputClass } from '../form/inputStyles';

// Checkout's guest-info block, kept in step with the admin forms by using the same
// FormField + input style helpers. Validation state is still owned by CartPage
// (validateCheckout populates `errors`); FormField just renders whatever it's given.
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
                <FormField id="fullName" name="fullName" error={errors.fullName}>
                    <input
                        id="fullName" name="fullName" type="text"
                        value={guestInfo.fullName}
                        onChange={handleChange('fullName')}
                        placeholder={t('cart.fullName')}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                        className={inputClass(!!errors.fullName)}
                    />
                </FormField>
                <FormField id="email" name="email" error={errors.email}>
                    <input
                        id="email" name="email" type="email"
                        value={guestInfo.email}
                        onChange={handleChange('email')}
                        placeholder={t('cart.email')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={inputClass(!!errors.email)}
                    />
                </FormField>
                <FormField id="phone" name="phone" error={errors.phone}>
                    <input
                        id="phone" name="phone" type="tel"
                        value={guestInfo.phone}
                        onChange={handleChange('phone')}
                        placeholder={t('cart.phone')}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className={inputClass(!!errors.phone)}
                    />
                </FormField>
            </div>
        </div>
    );
};

export default GuestInfoForm;
