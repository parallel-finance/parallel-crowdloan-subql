import { SubstrateEvent } from '@subql/types'
import { Vaults } from '../../types'

export const handleVaultCreated = async ({
  event: { data },
  extrinsic: {
    extrinsic: { hash }
  }
}: SubstrateEvent) => {
  const [
    paraId,
    vaultId,
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
    id:
      paraId.toString() +
      '-' +
      vaultId[0].toString() +
      '-' +
      vaultId[1].toString(),
    createdAt: hash.toString(),
    paraId,
    vaultId: vaultId[0].toString() + '-' + vaultId[1].toString(),
    ctokenId,
    phase,
    contributions: 0,
    totalAmount: '0',
    contributionStrategy,
    cap,
    endBlock,
    trieIndex
  })
  logger.info(`handle VaultCreated ${JSON.stringify(vaultRecord)}`)

  try {
    await vaultRecord.save()
  } catch (error) {
    logger.error('handle VaultCreated error: ', error)
  }
}

export const handleVaultUpdated = async ({
  event: { data }
}: SubstrateEvent) => {
  const [paraId, vaultId, contributionStrategy, cap, endBlock] = JSON.parse(
    data.toString()
  ) as [number, number[], string, string, number]

  let vault =
    paraId.toString() +
    '-' +
    vaultId[0].toString() +
    '-' +
    vaultId[1].toString()
  let vaultRecord = await Vaults.get(vault)
  if (vaultRecord) {
    vaultRecord.contributionStrategy = contributionStrategy
    vaultRecord.cap = cap
    vaultRecord.endBlock = endBlock
    logger.info(`handle VaultUpdated: ${JSON.stringify(vaultRecord)}`)
  } else {
    logger.error(
      `cannot update the vault which is not found: ${JSON.stringify(vault)}`
    )
  }

  try {
    await vaultRecord.save()
  } catch (error) {
    logger.error('handle VaultUpdated error: ', error)
  }
}

export const handleVaultPhaseUpdated = async ({
  event: { data }
}: SubstrateEvent) => {
  const [paraId, vaultId, prePhase, curPhase] = JSON.parse(data.toString()) as [
    number,
    number[],
    string,
    string
  ]

  let vault =
    paraId.toString() +
    '-' +
    vaultId[0].toString() +
    '-' +
    vaultId[1].toString()
  let vaultRecord = await Vaults.get(vault)
  if (vaultRecord) {
    vaultRecord.phase = curPhase
    logger.info(`handle VaultPhaseUpdated: ${JSON.stringify(vaultRecord)}`)
  } else {
    logger.error(
      `cannot update the vault which is not found: ${JSON.stringify(vault)}`
    )
  }

  try {
    await vaultRecord.save()
  } catch (error) {
    logger.error('handle VaultPhaseUpdated error: ', error)
  }
}

export const handleVaultDissolved = async ({
  event: { data }
}: SubstrateEvent) => {
  const [paraId, vaultId] = JSON.parse(data.toString()) as [number, number[]]

  let vault =
    paraId.toString() +
    '-' +
    vaultId[0].toString() +
    '-' +
    vaultId[1].toString()
  await Vaults.remove(vault)
  logger.info(`handle VaultDissolved: ${vault}`)
}

export const updateVaultSummary = async (vault: string, amount: string) => {
  let vaultRecord = await Vaults.get(vault)
  if (vaultRecord) {
    vaultRecord.contributions += 1
    vaultRecord.totalAmount = (
      BigInt(vaultRecord.totalAmount) + BigInt(amount)
    ).toString()

    logger.info(`handle VaultSummaryUpdated: ${JSON.stringify(vaultRecord)}`)
  } else {
    logger.error(
      `Cannot update the vault which is not found: ${JSON.stringify(vault)}`
    )
  }

  try {
    await vaultRecord.save()
  } catch (error) {
    logger.error('update VaultSummary error: ', error)
  }
}
