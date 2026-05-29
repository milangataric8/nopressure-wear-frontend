import { useTranslation } from 'react-i18next';

const StatusBadge = ({ active }) => {
    const { t } = useTranslation();
    return (
        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
            active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
        }`}>
            {active ? t('admin.active') : t('admin.inactive')}
        </span>
    );
};

export default StatusBadge;