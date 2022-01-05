import { SubstrateEvent } from '@subql/types';
import { CrowdloanHandler } from '../handlers/contributions';

export class EventHandler {
  private event: SubstrateEvent;

  constructor(event: SubstrateEvent) {
    this.event = event;
  }
  
  public async save() {
    await CrowdloanHandler.checkAndSave(this.event);
  }
}
