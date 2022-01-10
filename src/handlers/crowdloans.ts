import { SubstrateEvent } from '@subql/types'
import { CROWDLOANEXECUTORS, Executor } from './executors'

export class CrowdloanHandler {
  static async checkAndSave(substrateEvent: SubstrateEvent) {
    const {
      event: { method }
    } = substrateEvent
    if (method in CROWDLOANEXECUTORS) {
      await CROWDLOANEXECUTORS[method](substrateEvent)
    } else {
      logger.warn(`Ignore unknown crowdloan method`)
    }
  }
}
