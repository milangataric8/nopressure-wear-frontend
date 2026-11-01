import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useBackgroundRemovalEnabled = () => {
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        axiosInstance.get('/upload/features', { signal: controller.signal })
            .then(({ data }) => {
                if (!controller.signal.aborted) setEnabled(data.removeBackgroundEnabled === true);
            })
            .catch(() => {
                if (!controller.signal.aborted) setEnabled(false);
            });
        return () => controller.abort();
    }, []);

    return enabled;
};
