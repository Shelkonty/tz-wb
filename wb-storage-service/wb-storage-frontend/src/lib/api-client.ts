import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    getSheets: () => apiClient.get('/api/sheets'),
    addSheet: (data: { sheet_id: string; sheet_name: string }) =>
        apiClient.post('/api/sheets', data),
    deleteSheet: (id: number) => apiClient.delete(`/api/sheets/${id}`),

    getCoefficients: (date: string) =>
        apiClient.get(`/api/coefficients?date=${date}`),

    getStatus: () => apiClient.get('/api/status'),
};