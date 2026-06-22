import { useTranslation } from 'react-i18next';
import signature from '../../../../uploads/products/nopressure_signature_footer.png';

const ProductDescription = ({ description, isOpen, onToggle }) => {
    const { t } = useTranslation();

    return (
        <div className="border-t border-gray-200 mt-5">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left"
            >
                <span className="text-sm font-semibold text-black">{t('review.description')}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18" height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
            {isOpen && (
                <div className="pb-6">
                    <div
                        className="product-description text-sm text-gray-900 text-center"
                        style={{
                            maxWidth: '100%',
                            overflowWrap: 'anywhere',
                        }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                    <div className="product-description text-sm text-gray-900 justify-items-center text-center">
                        <img src={signature} alt="Logo" className="h-12 w-auto" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDescription;