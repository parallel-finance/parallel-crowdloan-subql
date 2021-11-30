import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { Contribution, VaultSummary } from "../types";
import { Extrinsic } from "@polkadot/types/interfaces";
import type { Vec, Result, Null, Option } from "@polkadot/types";

const checkTransaction = (sectionFilter: string, methodFilter: string, call: Extrinsic) => {
    const { section, method } = api.registry.findMetaCall(call.callIndex);
    return section === sectionFilter && method === methodFilter;
};


export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    const call = extrinsic.extrinsic;
    if (!checkTransaction("crowdloans", "contribute", call)) {
        return;
    }
    const { args: [paraIdRaw, amountRaw, referralCodeRaw] } = call;

    const contributionRecord = Contribution.create({
        id: extrinsic.extrinsic.hash.toString(),

        blockHeight: extrinsic.block.block.header.number.toNumber(),
        paraId: parseInt(paraIdRaw.toString()),
        account: extrinsic.extrinsic.signer.toString(),
        amount: amountRaw.toString(),
        referralCode: referralCodeRaw.toString(),
        timestamp: extrinsic.block.timestamp,
    });
    logger.info(JSON.stringify(contributionRecord));

    await contributionRecord.save();

    let summaryRecord = await VaultSummary.get(paraIdRaw.toString());
    if (summaryRecord) {
        summaryRecord.contributions += 1;
        summaryRecord.amount = (BigInt(summaryRecord.amount) + BigInt(amountRaw.toString())).toString()
    } else {
        summaryRecord = VaultSummary.create({
            id: paraIdRaw.toString(),
            contributions: 1,
            amount: amountRaw.toString(),
        });
    }
    logger.info(JSON.stringify(summaryRecord));

    await summaryRecord.save();
}
