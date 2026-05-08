import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadImage } from '../../api/uploadApi';
import {getImageUrl} from "../../utils/imageUtils.js";

const ImageUpload = ({ currentImageUrl, onImageUploaded }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImageUrl || null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        e.target.value = '';

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const response = await uploadImage(file);
            onImageUploaded(response.data.url);
            toast.success('Image uploaded');
        } catch (e) {
            toast.error('Failed to upload image, error: ' + e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="border border-gray-300 p-4 mb-3">
                {preview ? (
                    <img
                        src={preview.startsWith('data:') ? preview : getImageUrl(preview)}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                    />
                ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                    </div>
                )}
            </div>

            <label className="cursor-pointer">
                <div className="border border-gray-300 text-center py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />
            </label>
        </div>
    );
};

export default ImageUpload;