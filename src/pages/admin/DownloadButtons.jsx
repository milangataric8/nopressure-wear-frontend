import { useState } from 'react';
import { toast } from 'react-toastify';
import {t} from "i18next";

const DownloadButtons = ({ pdfFn,
                           excelFn,
                           pdfClass = 'border-red-800 text-red-800 hover:bg-red-800 hover:text-white',
                           excelClass = 'border-green-800 text-green-800 hover:bg-green-800 hover:text-white',
                           layout = 'flex gap-2 w-full' }) => {
    const [downloading, setDownloading] = useState('');

    const handleDownload = async (fn, key) => {
        setDownloading(key);
        try {
            await fn();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToDownloadReport'));
        } finally {
            setDownloading('');
        }
    };

    return (
        <div className={layout}>
            <button
                onClick={() => handleDownload(pdfFn, 'pdf')}
                disabled={downloading === 'pdf'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 border text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${pdfClass}`}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <polyline points="9 15 12 18 15 15"/>
                </svg>
                {downloading === 'pdf' ? '...' : 'PDF'}
            </button>
            <button
                onClick={() => handleDownload(excelFn, 'excel')}
                disabled={downloading === 'excel'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 border text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${excelClass}`}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <polyline points="9 15 12 18 15 15"/>
                </svg>
                {downloading === 'excel' ? '...' : 'Excel'}
            </button>
        </div>
    );
};

export default DownloadButtons;