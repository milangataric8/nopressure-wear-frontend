const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-start justify-between">

                    {/* Branding */}
                    <div className="w-1/3">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4">
                            WebShop
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                            Your premium destination for quality products.
                            We deliver the best shopping experience.
                        </p>
                    </div>

                    {/* Store info */}
                    <div className="w-1/3 flex justify-center">
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                                Visit Us
                            </h4>
                            <div className="space-y-2 text-xs text-gray-500">
                                <p>Bulevar Oslobodjenja 15</p>
                                <p>21000 Novi Sad, Serbia</p>
                                <p className="mt-3">Mon — Fri: 9:00 — 20:00</p>
                                <p>Sat: 9:00 — 16:00</p>
                                <p>Sun: Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="w-1/3 flex justify-end">
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                                Contact
                            </h4>
                            <div className="space-y-2 text-xs text-gray-500">
                                <p>info@webshop.com</p>
                                <p>+381 21 123 456</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="mt-10 border-t border-gray-200 pt-10">
                    <h4 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        Find Us
                    </h4>
                    <div className="w-full h-48 border border-gray-200">
                        <iframe
                            title="Store Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2800!2d19.8335!3d45.2671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b10613de93455%3A0xb6f5fd9f3b4f2cd1!2sBulevar%20oslobo%C4%91enja%2C%20Novi%20Sad!5e0!3m2!1sen!2srs!4v1234567890"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-200 mt-10 pt-6 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        © 2026 WebShop. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">
                            Terms of Use
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;