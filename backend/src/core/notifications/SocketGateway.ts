import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import logger from '../../services/logger.js';
import { getIO, notifyAdmins } from '../../sockets/index.js';

export class SocketGateway {
  /**
   * Broadcast queue status updates (active, waiting, failed jobs count) to the admin panel
   */
  static broadcastQueueStatus(
    queueName: string,
    metrics: { waiting: number; active: number; failed: number; completed: number }
  ) {
    try {
      notifyAdmins('queue_status_update', {
        queue: queueName,
        metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn(`[SocketGateway] Failed to broadcast queue status: ${(error as any).message}`);
    }
  }

  /**
   * Live notification of campaign success
   */
  static notifyCampaignSuccess(campaignId: string, campaignName: string) {
    try {
      notifyAdmins('campaign_completed', {
        campaignId,
        campaignName,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn(`[SocketGateway] Failed to notify campaign success: ${(error as any).message}`);
    }
  }

  /**
   * Live notification of campaign failure
   */
  static notifyCampaignFailure(campaignId: string, campaignName: string, errorMsg: string) {
    try {
      notifyAdmins('campaign_failed', {
        campaignId,
        campaignName,
        status: 'failed',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn(`[SocketGateway] Failed to notify campaign failure: ${(error as any).message}`);
    }
  }
}
