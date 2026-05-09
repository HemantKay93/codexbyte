import { apiClient } from '../apiClient';

export const CMSService = {
  getContent: async (pageSlug: string, sectionKeys?: string[]) => {
    const params = sectionKeys ? { sectionKeys: sectionKeys.join(',') } : {};
    const response = await apiClient.get(`/cms/${pageSlug}`, { params });
    return response.data;
  },

  updateContent: async (pageSlug: string, sectionKey: string, content: any) => {
    const response = await apiClient.put(`/admin/cms/${pageSlug}/${sectionKey}`, { content });
    return response.data;
  },

  updatePageContent: async (pageSlug: string, contentBySection: Record<string, any>) => {
    const updates = await Promise.all(
      Object.entries(contentBySection).map(([sectionKey, content]) =>
        CMSService.updateContent(pageSlug, sectionKey, content)
      )
    );
    return updates;
  },
};
