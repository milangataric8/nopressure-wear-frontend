import App from './App.jsx';
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
                <App />
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