import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const CheckoutForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/orders',
            },
            redirect: 'if_required',
        });

        if (error) {
            toast.error(error.message);
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success(t('messages.paymentSuccess'));
            onSuccess();
        }
    };

    return (
        <div className="border border-gray-200 p-6">
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                {t('cart.payment')}
            </h3>
            <PaymentElement
                className="mb-4"
                options={{
                    layout: 'accordion',
                    defaultValues: {
                        billingDetails: {
                            email: '',
                        },
                    },
                }}
            />
            <button
                onClick={handleSubmit}
                disabled={!stripe || processing}
                className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {processing ? t('cart.processing') : t('cart.payNow')}
            </button>
        </div>
    );
};

export default CheckoutForm;