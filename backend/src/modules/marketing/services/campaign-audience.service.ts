import { SegmentService } from '../segment.service.js';
import { CampaignPayload } from '../../../core/contracts/index.js';

export class CampaignAudienceService {
  private segmentService: SegmentService;

  constructor() {
    this.segmentService = new SegmentService();
  }

  async resolveRecipients(campaignId: string, payload: CampaignPayload) {
    if (!payload.segmentId) return [];

    const users = await this.segmentService.resolveSegmentUsers(payload.segmentId);

    return users
      .map((u: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        // eslint-disable-line @typescript-eslint/no-explicit-any
        let contact = '';
        if (payload.channel === 'email') contact = u.email;
        else if (payload.channel === 'whatsapp') contact = u.phone;
        // else push token...

        return {
          campaign_id: campaignId,
          user_id: u.id,
          contact_address: contact,
          status: 'queued',
          variables: { customer_name: u.metadata?.first_name || 'Customer' },
        };
      }) // eslint-disable-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.contact_address); // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
