import { useQuery } from '@tanstack/react-query';
import { CMSService } from '@byteevolvr/api-client';

export function useCMS(pageSlug: string, sectionKeys?: string[]) {
  return useQuery({
    queryKey: ['cms', pageSlug, sectionKeys],
    queryFn: async () => {
      const data = await CMSService.getContent(pageSlug, sectionKeys);
      const contentMap: Record<string, any> = {};
      data.forEach((item: any) => {
        contentMap[item.section_key] = item.content;
      });
      return contentMap;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
