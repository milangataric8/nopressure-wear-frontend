import axiosInstance from './axiosInstance';

export const getEmployees = (params) => axiosInstance.get('/employees', { params });

// Role changes go through the regular update — one request for name/email/role together,
// not a separate PATCH, so a partial failure can't save the name but drop the role change.
export const updateEmployee = (id, payload) => axiosInstance.put(`/employees/${id}`, payload);
