import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getLegalContent, updateLegalContent } from '../../api/legalApi';
import RichTextEditor from '../../components/common/RichTextEditor';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGES = [
    { key: 'PRIVACY',  labelKey: 'legal.privacyTitle' },
    { key: 'TERMS',    labelKey: 'legal.termsTitle' },
    { key: 'RETURNS',  labelKey: 'legal.returnsTitle' },
    { key: 'IMPRINT',  labelKey: 'legal.imprintTitle' },
];

const LANGS = ['en', 'sr'];

const AdminLegal = () => {
    const { t } = useTranslation();
    const [activePage, setActivePage] = useState('PRIVACY');
    const [activeLang, setActiveLang] = useState('en');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            const r = await getLegalContent(activePage, activeLang);
            setContent(r.data.content || '');
        } catch {
            setContent('');
        } finally {
            setLoading(false);
        }
    }, [activePage, activeLang]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateLegalContent(activePage, activeLang, content);
            toast.success(t('admin.legalSaved'));
        } catch {
            toast.error(t('admin.legalSaveFailed'));
        } finally {
            setSaving(false);
        }
    };

    const tabClass = (active) =>
        `px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            active ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
        }`;

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <AdminPageHeader
                title={t('admin.legal')}
                subtitle={t('admin.manageLegal')}
            />

            {/* Page tabs */}
            <div className="flex border border-gray-200 w-fit mb-6">
                {PAGES.map(p => (
                    <button
                        key={p.key}
                        onClick={() => setActivePage(p.key)}
                        className={tabClass(activePage === p.key)}
                    >
                        {t(p.labelKey)}
                    </button>
                ))}
            </div>

            {/* Language tabs */}
            <div className="flex gap-2 mb-4">
                {LANGS.map(lang => (
                    <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1 text-xs font-semibold uppercase border transition-colors ${
                            activeLang === lang
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                        }`}
                    >
                        {lang}
                    </button>
                ))}
            </div>

            {/* Editor */}
            <div className="border border-gray-200">
                {loading ? (
                    <LoadingSpinner height="h-64" />
                ) : (
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder={`${t(PAGES.find(p => p.key === activePage)?.labelKey)} (${activeLang.toUpperCase()})`}
                    />
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {saving ? t('common.loading') : t('common.save')}
                </button>
            </div>
        </div>
    );
};

export default AdminLegal;
