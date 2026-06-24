import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { sendNotification, getNotificationHistory, getChannelStatus, deleteNotification } from '../api/notificationApi';
import { uploadImage } from '../api/uploadApi';
import { getImageUrl } from '../utils/imageUtils';
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import RichTextEditor from '../components/common/RichTextEditor';

const AdminNotifications = () => {
    const { t } = useTranslation();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedChannels, setSelectedChannels] = useState(['EMAIL']);
    const [channelStatus, setChannelStatus] = useState({});
    const [history, setHistory] = useState([]);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [removeBgNotification, setRemoveBgNotification] = useState(false);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#111111');


    const fetchData = useCallback(async () => {
        try {
            const [statusRes, historyRes] = await Promise.all([
                getChannelStatus(),
                getNotificationHistory(),
            ]);
            setChannelStatus(statusRes.data);
            setHistory(historyRes.data);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleChannel = (channel) => {
        setSelectedChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error(t('messages.messageRequired'));
            return;
        }
        if (selectedChannels.length === 0) {
            toast.error(t('messages.selectChannel'));
            return;
        }
        if (!window.confirm(t('messages.confirmSend', { channels: selectedChannels.join(', ') }))) return;

        setSending(true);
        try {
            const res = await sendNotification({ subject, message, imageUrl, bgColor, textColor, channels: selectedChannels });
            toast.success(t('messages.notificationSent', {
                email: res.data.emailSent,
                whatsapp: res.data.whatsappSent,
                viber: res.data.viberSent,
            }));
            setSubject('');
            setMessage('');
            setImageUrl('');
            setBgColor('#ffffff');
            setTextColor('#111111');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToSendNotification'));
        } finally {
            setSending(false);
        }
    };

    const channels = [
        { key: 'EMAIL', label: 'Email' },
        // { key: 'WHATSAPP', label: 'WhatsApp' },
        // { key: 'VIBER', label: 'Viber' },
    ]

    const handleReuse = (broadcast) => {
        setSubject(broadcast.subject || '');
        setMessage(broadcast.message || '');
        setImageUrl(broadcast.imageUrl || '');
        setBgColor(broadcast.bgColor || '#ffffff');
        setTextColor(broadcast.textColor || '#111111');
        setSelectedChannels(broadcast.channels.split(',').map(c => c.trim()));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(t('messages.loadedIntoForm'));
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('messages.confirmDeleteBroadcast'))) return;
        try {
            await deleteNotification(id);
            toast.success(t('messages.notificationDeleted'));
            setHistory(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToDeleteNotification'));
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    {t('admin.notifications')}
                </h1>
                <p className="text-sm text-gray-500">{t('admin.sendPromotionalNotifications')}</p>
            </div>

            {/* Compose */}
            <div className="border border-gray-200 p-8 mb-10">
                <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                    {t('admin.newNotification')}
                </h2>

                {/* Channels */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                        {t('admin.channels')}
                    </label>
                    <div className="flex gap-3">
                        {channels.map(ch => {
                            const enabled = channelStatus[ch.key];
                            const selected = selectedChannels.includes(ch.key);
                            return (
                                <button
                                    key={ch.key}
                                    onClick={() => enabled && toggleChannel(ch.key)}
                                    disabled={!enabled}
                                    className={`flex-1 py-3 border text-sm font-semibold uppercase tracking-wide transition-colors ${
                                        !enabled
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            : selected
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                                    }`}
                                >
                                    {ch.label}
                                    {!enabled && <span className="block text-xs font-normal normal-case mt-0.5">{t('admin.notConfigured')}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Image */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                        {t('admin.imageOptional')}
                    </label>
                    {imageUrl ? (
                        <div className="relative inline-block">
                            <img
                                src={getImageUrl(imageUrl)}
                                alt="Notification"
                                className="h-32 object-contain border border-gray-200"
                            />
                            <button
                                onClick={() => setImageUrl('')}
                                className="absolute top-1 right-1 w-6 h-6 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                <input
                                    type="checkbox"
                                    checked={removeBgNotification}
                                    onChange={(e) => setRemoveBgNotification(e.target.checked)}
                                    className="w-3.5 h-3.5"
                                />
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    {t('admin.removeBackground')}
                                </span>
                            </label>
                            <label className="cursor-pointer inline-block">
                            <div className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                {uploading ? t('common.uploading') : t('admin.uploadImage')}
                            </div>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                                className="hidden"
                                disabled={uploading}
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    e.target.value = '';
                                    setUploading(true);
                                    try {
                                        const response = await uploadImage(file, removeBgNotification);
                                        setImageUrl(response.data.url);
                                        toast.success(t('messages.imageUploaded'));
                                    } catch (e) {
                                        toast.error(e.response?.data?.message || t('messages.failedToUploadImage'));
                                    } finally {
                                        setUploading(false);
                                    }
                                }}
                            />
                        </label>
                        </div>
                    )}
                </div>

                {/* Subject */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                        {t('admin.subjectEmailOnly')}
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t('admin.subjectPlaceholder')}
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                </div>

                {/* Colors */}
                <div className="flex gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                            {t('admin.backgroundColor') || 'Background'}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-12 h-9 border border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">{bgColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                            {t('admin.textColor') || 'Text'}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-12 h-9 border border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">{textColor}</span>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                        {t('admin.notificationMessage')}
                    </label>
                    <RichTextEditor
                        value={message}
                        onChange={setMessage}
                        placeholder={t('admin.messagePlaceholder')}
                    />
                </div>

                {/* Preview */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        {t('admin.preview') || 'Preview'}
                    </label>
                    <div className="border border-gray-200 p-2">
                        <div style={{ backgroundColor: bgColor, padding: '32px', maxWidth: '560px', margin: '0 auto' }}>
                            {imageUrl && (
                                <img
                                    src={getImageUrl(imageUrl)}
                                    alt=""
                                    style={{ width: '100%', height: 'auto', marginBottom: '20px', display: 'block' }}
                                />
                            )}
                            {subject && (
                                <h2 style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: '0 0 20px', color: textColor }}>
                                    {subject}
                                </h2>
                            )}
                            <div
                                className="broadcast-content"
                                style={{ fontSize: '14px', lineHeight: 1.6, color: textColor }}
                                dangerouslySetInnerHTML={{ __html: message }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSend}
                    disabled={sending || !message.trim() || selectedChannels.length === 0}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-30"
                >
                    {sending ? t('admin.sending') : t('admin.sendNotification')}
                </button>
            </div>

            {/* History */}
            <div className="border border-gray-200 p-8">
                <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                    {t('admin.notificationHistory')}
                </h2>
                {history.length === 0 ? (
                    <p className="text-sm text-gray-400">{t('admin.noNotificationsSent')}</p>
                ) : (
                    <div className="space-y-4">
                        {history.map(b => (
                            <div key={b.id} className="border-b border-gray-100 pb-4">
                                <div className="flex gap-3">
                                    {b.imageUrl && (
                                        <img src={getImageUrl(b.imageUrl)} alt="" className="w-16 h-16 object-cover flex-shrink-0 border border-gray-100" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-black">{b.subject || t('admin.noSubject')}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400">{new Date(b.sentAt).toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleReuse(b)}
                                                    className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors underline"
                                                >
                                                    {t('admin.reuse')}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(b.id)}
                                                    className="text-xs font-semibold uppercase tracking-wide text-red-400 hover:text-red-600 transition-colors underline"
                                                >
                                                    {t('admin.delete')}
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mb-2 line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: b.message }}
                                        />
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">{t('admin.channelsLabel', { value: b.channels })}</span>
                                            <span className="text-xs text-gray-400">{t('admin.recipientsLabel', { count: b.recipients })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
