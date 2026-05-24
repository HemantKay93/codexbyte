import { StateMachine } from './StateMachine.js';

export type CampaignState =
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'paused'
  | 'cancelled'
  | 'failed';

export type CampaignEvent =
  | 'SCHEDULE'
  | 'ENQUEUE'
  | 'PROCESS'
  | 'COMPLETE'
  | 'PAUSE'
  | 'RESUME'
  | 'CANCEL'
  | 'FAIL';

export class CampaignStateMachine extends StateMachine<CampaignState, CampaignEvent> {
  protected configure(): void {
    // draft
    this.addTransition('draft', 'SCHEDULE', 'scheduled');
    this.addTransition('draft', 'ENQUEUE', 'queued');
    this.addTransition('draft', 'CANCEL', 'cancelled');

    // scheduled
    this.addTransition('scheduled', 'ENQUEUE', 'queued');
    this.addTransition('scheduled', 'CANCEL', 'cancelled');

    // queued
    this.addTransition('queued', 'PROCESS', 'processing');
    this.addTransition('queued', 'PAUSE', 'paused');
    this.addTransition('queued', 'CANCEL', 'cancelled');
    this.addTransition('queued', 'FAIL', 'failed');

    // processing
    this.addTransition('processing', 'COMPLETE', 'completed');
    this.addTransition('processing', 'PAUSE', 'paused');
    this.addTransition('processing', 'FAIL', 'failed');

    // paused
    this.addTransition('paused', 'RESUME', 'queued'); // resuming goes back to queue
    this.addTransition('paused', 'CANCEL', 'cancelled');

    // failed
    this.addTransition('failed', 'ENQUEUE', 'queued'); // manual retry
  }
}
