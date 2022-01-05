import { SubstrateEvent } from '@subql/types';
import { Contribution, VaultSummary } from "../types";

export class CrowdloanHandler {
    static async checkAndSave(substrateEvent: SubstrateEvent) {
      const {
        event: { method },
      } = substrateEvent;

      if (method === 'VaultContributed') {
        await this.handleContributed(substrateEvent);
      }
    }

    static async handleContributed({
        event: { data },
        block: { timestamp, block: { header } },
        extrinsic,
    }: SubstrateEvent) {
        logger.info(JSON.parse(data.toString()))
        const [paraId, vaultId, contributor, amount, referralCode] = 
            JSON.parse(data.toString()) as [number, number, string, string, string];
        const contributionRecord = Contribution.create({
            id: extrinsic.extrinsic.hash.toString(),
            vaultId,
            blockHeight: header.number.toNumber(),
            paraId,
            account: contributor,
            amount,
            referralCode,
            timestamp: timestamp,
        });
        logger.info(JSON.stringify(contributionRecord));

        try {
            await contributionRecord.save();
            
            // Update vault summary if contributed
            await this.updateVaultSummary(paraId, amount)
        } catch (error) {
          logger.error('handle Contributed error: ', error);
        }
    }

    static async updateVaultSummary(paraId: number, amount: string) {
        let summaryRecord = await VaultSummary.get(paraId.toString());
        if (summaryRecord) {
            summaryRecord.contributions += 1;
            summaryRecord.amount = (BigInt(summaryRecord.amount) + BigInt(amount)).toString()
        } else {
            summaryRecord = VaultSummary.create({
                id: paraId.toString(),
                contributions: 1,
                amount,
            });
        }
        logger.info(JSON.stringify(summaryRecord));
    
        try {
            await summaryRecord.save();
        } catch (error) {
            logger.error('update VaultSummary error: ', error);
        }
    }
}
