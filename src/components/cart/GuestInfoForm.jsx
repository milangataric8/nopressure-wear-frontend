import { useTranslation } from 'react-i18next';

const GuestInfoForm = ({ guestInfo, setGuestInfo }) => {
    const { t } = useTranslation();

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black";

    return (
        <div className="border border-gray-200 p-6 mb-6">
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                {t('cart.yourInformation')}
            </h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={guestInfo.fullName}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder={t('cart.fullName')}
                    className={inputClass}
                />
                <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('cart.email')}
                    className={inputClass}
                />
                <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('cart.phone')}
                    className={inputClass}
                />
            </div>
        </div>
    );
};

export default GuestInfoForm;