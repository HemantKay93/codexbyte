import { apiClient } from '../apiClient';

export const DocumentsService = {
  getDocuments: (folderId?: string) => apiClient.get(`/documents${folderId ? `?folderId=${folderId}` : ''}`),
  createDocument: (data: any) => apiClient.post('/documents', data),
  uploadDocument: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    const res = await fetch(`${apiClient.defaults.baseURL}/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  archiveDocument: (documentId: string) => apiClient.delete(`/documents/${documentId}`),
  
  getVersions: (documentId: string) => apiClient.get(`/documents/${documentId}/versions`),
  addVersion: (documentId: string, data: any) => apiClient.post(`/documents/${documentId}/versions`, data),
};
