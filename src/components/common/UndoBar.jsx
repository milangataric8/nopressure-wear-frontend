import { useTranslation } from 'react-i18next';

const UndoBar = ({ message, onUndo }) => {
    const { t } = useTranslation();

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))]
                       left-1/2 -translate-x-1/2 z-50
                       w-[calc(100%-2rem)] max-w-md
                       bg-black text-white
                       flex items-center justify-between gap-4
                       px-4 py-3 shadow-lg"
        >
            <span className="text-sm truncate">{message}</span>
            <button
                onClick={onUndo}
                className="text-xs font-semibold uppercase tracking-wide underline
                           hover:text-gray-300 transition-colors flex-shrink-0"
            >
                {t('common.undo')}
            </button>
        </div>
    );
};

export default UndoBar;
