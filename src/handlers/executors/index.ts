import {
  handleVaultCreated,
  handleVaultUpdated,
  handleVaultPhaseUpdated,
  handleVaultDissolved
} from './vault'
import { SubstrateEvent } from '@subql/types'
import { handleContributed } from './contribution'

export type Executor = (event: SubstrateEvent) => Promise<void>

export const CROWDLOANEXECUTORS: { [method: string]: Executor } = {
  ['VaultCreated']: handleVaultCreated,
  ['VaultContributed']: handleContributed,
  ['VaultUpdated']: handleVaultUpdated,
  ['VaultPhaseUpdated']: handleVaultPhaseUpdated,
  ['VaultDissolved']: handleVaultDissolved
}
