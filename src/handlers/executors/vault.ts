import { SubstrateEvent } from '@subql/types'
import { DissolvedVault, Vaults, Contribution } from '../../types'
import { ensureStrNumber } from '../utils/decimalts'

export function aggregateIntoId(
  paraId: string,
  leaseStart: string,
  leaseEnd: string
) {
  return paraId + '-' + leaseStart + '-' + leaseEnd
}

export const handleVaultCreated = async ({
  event: { data },
  block: {
    block: { header }
  }
}: SubstrateEvent) => {
  const [
    paraId,
    [leaseStart, leaseEnd],
    ctokenId,
    phase,
    contributionStrategy,
    cap,
    endBlock,
    trieIndex
  ] = JSON.parse(data.toString()) as [
    number,
    number[],
    number,
    string,
    string,
    string,
    number,
    number
  ]
  const vaultRecord = Vaults.create({
    id: aggregateIntoId(
      paraId.toString(),
      leaseStart.toString(),
      leaseEnd.toString()
    ),
    createdAt: header.number.toNumber(),
    paraId,
    leaseStart,
    leaseEnd,
    ctokenId,
    phase,
    contributionCount: 0,
    totalAmount: '0',
    contributionStrategy,
    cap: ensureStrNumber(cap),
    endBlock: endBlock,
    trieIndex: trieIndex
  })

  try {
    await vaultRecord.save()

    logger.info(
      `#${header.number.toNumber()} handle VaultCreated ${JSON.stringify(
        vaultRecord
      )}`
    )
  } catch (error) {
    logger.error('handle VaultCreated error: ', error)
  }
}

export const handleVaultUpdated = async ({
  event: { data },
  block: {
    block: { header }
  }
}: SubstrateEvent) => {
  const [paraId, vaultId, contributionStrategy, cap, endBlock] = JSON.parse(
    data.toString()
  ) as [number, number[], string, string, number]

  let vault = aggregateIntoId(
    paraId.toString(),
    vaultId[0].toString(),
    vaultId[1].toString()
  )
  let vaultRecord = await Vaults.get(vault)
  if (vaultRecord) {
    vaultRecord.contributionStrategy = contributionStrategy
    vaultRecord.cap = ensureStrNumber(cap)
    vaultRecord.endBlock = endBlock
  } else {
    logger.error(
      `cannot update the vault which is not found: ${JSON.stringify(vault)}`
    )
  }

  try {
    await vaultRecord.save()

    logger.info(
      `#${header.number.toNumber()} handle VaultUpdated: ${JSON.stringify(
        vaultRecord
      )}`
    )
  } catch (error) {
    logger.error('handle VaultUpdated error: ', error)
  }
}

export const handleVaultPhaseUpdated = async ({
  event: { data },
  block: {
    block: { header }
  }
}: SubstrateEvent) => {
  const [paraId, vaultId, prePhase, curPhase] = JSON.parse(data.toString()) as [
    number,
    number[],
    string,
    string
  ]

  let vault = aggregateIntoId(
    paraId.toString(),
    vaultId[0].toString(),
    vaultId[1].toString()
  )
  let vaultRecord = await Vaults.get(vault)
  if (vaultRecord) {
    vaultRecord.phase = curPhase
  } else {
    logger.error(
      `cannot update the vault which is not found: ${JSON.stringify(vault)}`
    )
  }

  try {
    await vaultRecord.save()

    logger.info(
      `#${header.number.toNumber()} handle VaultPhaseUpdated: ${JSON.stringify(
        vaultRecord
      )}`
    )
  } catch (error) {
    logger.error('handle VaultPhaseUpdated error: ', error)
  }
}

export const handleVaultDissolved = async ({
  idx,
  event: { data },
  extrinsic: {
    extrinsic: { hash }
  },
  block: {
    block: { header }
  }
}: SubstrateEvent) => {
  const [paraId, vaultId] = JSON.parse(data.toString()) as [number, number[]]

  let aggregateVaultId = aggregateIntoId(
    paraId.toString(),
    vaultId[0].toString(),
    vaultId[1].toString()
  )

  logger.info(
    `#${header.number.toNumber()} handle VaultDissolved: ${aggregateVaultId}`
  )

  try {
    let vault = await Vaults.get(aggregateVaultId)

    await DissolvedVault.create({
      id: `${hash.toString()}-${idx.toString()}`,
      vaultId: aggregateVaultId,
      createdAt: vault.createdAt,
      dissolvedBlockHeight: header.number.toNumber(),
      totalAmount: vault.totalAmount,
      contributionCount: vault.contributionCount
    }).save()

    while (true) {
      const contributions = await Contribution.getByVaultId(vault.id)
      if (contributions.length === 0) {
        break
      } else {
        // Can't use promise all, because it contains a transaction.
        for (let contribution of contributions) {
          await Contribution.remove(contribution.id)
        }
      }
    }

    await Vaults.remove(vault.id)
  } catch (error) {
    logger.error('handle VaultDissolved error: ', error)
  }
}

export const updateVaultSummary = async (vault: string, amount: string) => {
  let vaultRecord = await Vaults.get(vault)
  if (vaultRecord) {
    vaultRecord.contributionCount += 1
    vaultRecord.totalAmount = ensureStrNumber(
      (BigInt(vaultRecord.totalAmount) + BigInt(amount)).toString()
    )
  } else {
    logger.error(
      `Cannot update the vault which is not found: ${JSON.stringify(vault)}`
    )
  }

  try {
    await vaultRecord.save()
    logger.info(`handle VaultSummaryUpdated: ${JSON.stringify(vaultRecord)}`)
  } catch (error) {
    logger.error('handle VaultSummary error: ', error)
  }
}
