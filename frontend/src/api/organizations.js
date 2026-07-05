import api from './axios';

export const getAllOrganizations = () => api.get('/organizations');

export const getOrganizationById = (id) => api.get(`/organizations/${id}`);

export const createOrganization = (data) => api.post('/organizations', data);

export const updateOrganization = (id, data) => api.put(`/organizations/${id}`, data);

export const deleteOrganization = (id) => api.delete(`/organizations/${id}`);
