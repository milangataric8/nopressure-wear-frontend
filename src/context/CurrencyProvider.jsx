import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettingsMap } from '../api/settingsApi';
import { CurrencyContext } from './CurrencyContext';

export const CurrencyProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [config, setConfig] = useState({
        base: 'RSD',
        byLang: { en: 'EUR', sr: 'RSD' },
        rates: { EUR: 0.0085, USD: 0.0092, RSD: 1 },
    });

    const load = () => {
        getSettingsMap().then(r => {
            const s = r.data;
            setConfig({
                base: s.base_currency || 'RSD',
                byLang: {
                    en: s.currency_en || 'EUR',
                    sr: s.currency_sr || 'RSD',
                },
                rates: {
                    RSD: 1,
                    EUR: parseFloat(s.exchange_rate_eur) || 0.0085,
                    USD: parseFloat(s.exchange_rate_usd) || 0.0092,
                },
            });
        }).catch(() => {});
    };

    useEffect(() => {
        load();
        const handler = () => load();
        window.addEventListener('settings-updated', handler);
        return () => window.removeEventListener('settings-updated', handler);
    }, []);

    const currentCurrency = config.byLang[i18n.language] || config.base;

    const convert = (amount) => {
        if (amount == null) return null;
        const rate = config.rates[currentCurrency] ?? 1;
        return Number(amount) * rate;
    };

    const format = (amount) => {
        if (amount == null) return '';
        const converted = convert(amount);
        const localeMap = { RSD: 'sr-RS', EUR: 'de-DE', USD: 'en-US' };
        const locale = localeMap[currentCurrency] || 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currentCurrency,
                minimumFractionDigits: currentCurrency === 'RSD' ? 0 : 2,
                maximumFractionDigits: currentCurrency === 'RSD' ? 0 : 2,
            }).format(converted);
        } catch {
            return `${converted.toFixed(2)} ${currentCurrency}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ currentCurrency, convert, format }}>
            {children}
        </CurrencyContext.Provider>
    );
};