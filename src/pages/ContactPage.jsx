import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { sendContactMessage } from '../api/contactApi';
import { getSettingsMap } from '../api/settingsApi';
import { useNavigate } from 'react-router-dom';
import SocialIcons from '../components/common/SocialIcons';
import Seo from '../components/seo/Seo';

const ContactPage = () => {
    const { i18n } = useTranslation();
    const [settings, setSettings] = useState({});
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        getSettingsMap().then(r => setSettings(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        getSettingsMap().then(r => {
            setSettings(r.data);
            if (r.data.contact_enabled === 'false') {
                navigate('/');
            }
        }).catch(() => {});
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await sendContactMessage(formData, i18n.language);
            toast.success(i18n.language === 'sr' ? 'Poruka je poslata!' : 'Message sent!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || (i18n.language === 'sr' ? 'Slanje nije uspelo' : 'Failed to send'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            <Seo title="Contact" url={`${window.location.origin}/contact`} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Left — Connect with us */}
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-6">
                        {i18n.language === 'sr' ? 'Povežimo se!' : 'Let\'s Connect!'}
                    </h1>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {i18n.language === 'sr'
                            ? `Dobrodošli na kontakt stranicu ${settings.store_name || ''} – vašeg omiljenog odredišta za vrhunski stil. Naš tim je tu da vam pruži besprekornu podršku i odgovori na sva pitanja koja imate.`
                            : `Welcome to the contact page of ${settings.store_name || ''} – your favorite destination for premium style. Our team is here to provide you with impeccable support and answer any questions you may have.`
                        }
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-10">
                        {i18n.language === 'sr'
                            ? 'Kontaktirajte nas putem forme ili nas direktno pozovite ili pošaljite e-mail. Radujemo se vašem kontaktu!'
                            : 'Contact us through the form or call us directly or send an email. We look forward to hearing from you!'
                        }
                    </p>

                    {/* Social media */}
                    <div className="mb-8">
                        <h3 className="text-sm font-black uppercase tracking-wide text-black mb-4">
                            {i18n.language === 'sr' ? 'Društvene mreže' : 'Social Media'}
                        </h3>
                        <SocialIcons settings={settings} size="md" />
                    </div>

                    {/* Contact info */}
                    <div className="space-y-3">
                        {settings.footer_email && (
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <a href={`mailto:${settings.footer_email}`} className="text-sm text-gray-600 hover:text-black transition-colors">
                                    {settings.footer_email}
                                </a>
                            </div>
                        )}
                        {settings.footer_phone && (
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <a href={`tel:${settings.footer_phone}`} className="text-sm text-gray-600 hover:text-black transition-colors">
                                    {settings.footer_phone}
                                </a>
                            </div>
                        )}
                        {settings.footer_address && (
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span className="text-sm text-gray-600">
                                    {settings.footer_address}, {settings.footer_city}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Contact form */}
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-8">
                        {i18n.language === 'sr' ? 'Pišite nam' : 'Write to Us'}
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">
                                {i18n.language === 'sr' ? 'Ime' : 'Name'}*
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">
                                Email*
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">
                                {i18n.language === 'sr' ? 'Naslov' : 'Subject'}
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">
                                {i18n.language === 'sr' ? 'Poruka' : 'Message'}*
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={6}
                                className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                                required
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={sending || !formData.name || !formData.email || !formData.message}
                            className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-30"
                        >
                            {sending
                                ? (i18n.language === 'sr' ? 'Slanje...' : 'Sending...')
                                : (i18n.language === 'sr' ? 'Pošalji' : 'Send')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;