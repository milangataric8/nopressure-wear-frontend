import { useTranslation } from 'react-i18next';

const EUR_TO_RSD = 120;

const useFormatPrice = () => {
    const { i18n } = useTranslation();
    return (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return '';
        if (i18n.language === 'sr') {
            const rsd = Math.round(num * EUR_TO_RSD);
            return `${rsd.toLocaleString('sr-RS')} RSD`;
        }
        return `€${num.toFixed(2)}`;
    };
};

export default useFormatPrice;
