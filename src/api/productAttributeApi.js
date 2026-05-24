import axiosInstance from "./axiosInstance.js";

export const addProductAttribute = (productId, data) =>
    axiosInstance.post(`/products/${productId}/attributes`, data);
export const deleteProductAttribute = (attributeId) =>
    axiosInstance.delete(`/products/attributes/${attributeId}`);