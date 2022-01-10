import { SubstrateEvent } from '@subql/types'
import { EventHandler } from '../handlers/event'

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const handler = new EventHandler(event)

  await handler.save()
}
