import { useState } from 'react';
import { toast } from 'react-toastify';

const DownloadButtons = ({ pdfFn, excelFn }) => {
    const [downloading, setDownloading] = useState('');

    const handleDownload = async (fn, key) => {
        setDownloading(key);
        try {
            await fn();
        } catch (_) {
            toast.error('Failed to download report');
        } finally {
            setDownloading('');
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleDownload(pdfFn, 'pdf')}
                disabled={downloading === 'pdf'}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-red-700 hover:text-black transition-colors disabled:opacity-50"
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
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-green-700 hover:text-black transition-colors disabled:opacity-50"
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