import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const AddCardForm = ({ onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Card added successfully!');
            onSuccess();
        }

        setProcessing(false);
    };

    return (
        <div className="border border-gray-200 p-6 mt-4">
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                Add New Card
            </h3>
            <PaymentElement className="mb-4" />
            <div className="flex gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={!stripe || processing}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Saving...' : 'Save Card'}
                </button>
                <button
                    onClick={onCancel}
                    className="border border-gray-300 text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddCardForm;