import axiosInstance from './axiosInstance';

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

const getExtension = (filename) => {
    const dot = filename.lastIndexOf('.');
    return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : '';
};

const isAllowedImage = (file) => {
    if (file.type.startsWith('image/')) return true;
    return ALLOWED_IMAGE_EXTENSIONS.includes(getExtension(file.name));
};

const isAllowedVideo = (file) => {
    if (file.type.startsWith('video/')) return true;
    return ALLOWED_VIDEO_EXTENSIONS.includes(getExtension(file.name));
};

const validationError = (message) =>
    Promise.reject({ response: { data: { message } } });

export const uploadImage = (file, removeBackground = false) => {
    if (!isAllowedImage(file)) {
        return validationError('Only image files are allowed (jpg, jpeg, png, gif, webp, bmp)');
    }
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/upload/image?removeBackground=${removeBackground}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadVideo = (file) => {
    if (!isAllowedVideo(file)) {
        return validationError('Only video files are allowed (mp4, webm, ogg, mov, avi, mkv)');
    }
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};