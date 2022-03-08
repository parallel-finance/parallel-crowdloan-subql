import { updateVaultSummary, aggregateIntoId } from './vault'
import { SubstrateEvent } from '@subql/types'
import { Contribution } from '../../types'
import { convertToAnyChainAddress } from '../utils/address'
import { ensureStrNumber } from '../utils/decimalts'

export const handleContributed = async ({
  idx,
  event: { data },
  block: {
    timestamp,
    block: { header }
  },
  extrinsic
}: SubstrateEvent) => {
  const [paraId, vaultId, contributor, amount] = JSON.parse(
    data.toString()
  ) as [number, number[], string, string, string]
  const contributionRecord = Contribution.create({
    id: `${extrinsic.extrinsic.hash.toString()}-${idx}`,
    extrinsicHash: extrinsic.extrinsic.hash.toString(),
    vaultId: aggregateIntoId(
      paraId.toString(),
      vaultId[0].toString(),
      vaultId[1].toString()
    ),
    blockHeight: header.number.toNumber(),
    account: convertToAnyChainAddress(contributor),
    amount: ensureStrNumber(amount),
    timestamp: timestamp
  })

  try {
    await contributionRecord.save()

    // Update vault summary if contributed
    let vault = aggregateIntoId(
      paraId.toString(),
      vaultId[0].toString(),
      vaultId[1].toString()
    )
    await updateVaultSummary(vault, amount)
    logger.info(
      `#${header.number.toNumber()} handle Contributed ${JSON.stringify(
        contributionRecord
      )}`
    )
  } catch (error) {
    logger.error('handle Contributed error: ', error)
  }
}
