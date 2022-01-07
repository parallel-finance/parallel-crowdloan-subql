import { updateVaultSummary } from "./vault";
import { SubstrateEvent } from '@subql/types';
import { Contribution } from "../../types";

export const handleContributed = async ({
    event: { data },
    block: { timestamp, block: { header } },
    extrinsic,
}: SubstrateEvent) => {
    const [paraId, vaultId, contributor, amount, referralCode] = 
        JSON.parse(data.toString()) as [number, number[], string, string, string];
    const contributionRecord = Contribution.create({
        id: extrinsic.extrinsic.hash.toString(),
        vaultId: vaultId[0].toString() + '-' + vaultId[1].toString(),
        blockHeight: header.number.toNumber(),
        paraId,
        account: contributor,
        amount,
        referralCode,
        timestamp: timestamp,
    });
    logger.info(`handle Contributed ${JSON.stringify(contributionRecord)}`);

    try {
        await contributionRecord.save();
        
        // Update vault summary if contributed
        let vault = paraId.toString() + '-' + vaultId[0].toString() + '-' + vaultId[1].toString()
        await updateVaultSummary(vault, amount)
    } catch (error) {
      logger.error('handle Contributed error: ', error);
    }
}

