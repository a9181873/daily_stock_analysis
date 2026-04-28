import apiClient from './index';

export type ContentType = 'analysis' | 'market_review';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  analysis: '個股分析報告',
  market_review: '大盤復盤',
};

export interface SubscriptionItem {
  id: string;
  email: string;
  contentTypes: ContentType[];
  active: boolean;
  createdAt: string | null;
}

export interface SubscribePayload {
  email: string;
  password: string;
  content_types: ContentType[];
}

export interface SubscriptionsListResponse {
  total: number;
  items: SubscriptionItem[];
}

export const subscriptionsApi = {
  async subscribe(payload: SubscribePayload): Promise<{ id: string; email: string }> {
    const { data } = await apiClient.post('/api/v1/subscribe', payload);
    return data as { id: string; email: string };
  },

  async list(): Promise<SubscriptionsListResponse> {
    const { data } = await apiClient.get<{
      total: number;
      items: Array<{
        id: string;
        email: string;
        content_types: ContentType[];
        active: boolean;
        created_at: string | null;
      }>;
    }>('/api/v1/subscriptions');
    return {
      total: data.total,
      items: data.items.map((item) => ({
        id: item.id,
        email: item.email,
        contentTypes: item.content_types,
        active: item.active,
        createdAt: item.created_at,
      })),
    };
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/subscriptions/${id}`);
  },
};
