import App from './App.jsx';
import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { GuestCartProvider } from './context/GuestCartContext';
import { CurrencyProvider } from './context/CurrencyProvider';
import { getSettingsMap } from './api/settingsApi';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './i18n/i18n';
import i18n from './i18n/i18n';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || undefined,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.0,
    enabled: import.meta.env.PROD,
});

const SentryApp = Sentry.withErrorBoundary(App, {
    fallback: ({ resetError }) => (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <h1>Something went wrong</h1>
            <p>Please try again.</p>
            <button onClick={resetError}>Reload</button>
        </div>
    ),
});

getSettingsMap().then(r => {
    const settings = r.data;
    // If multilanguage disabled, force default language
    if (settings.multilanguage_enabled === 'false' && settings.default_language) {
        i18n.changeLanguage(settings.default_language);
    }
}).catch(() => {});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <GuestCartProvider>
                <CurrencyProvider>
                <SentryApp />
                </CurrencyProvider>
                </GuestCartProvider>
                <ToastContainer
                    position="top-center"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)