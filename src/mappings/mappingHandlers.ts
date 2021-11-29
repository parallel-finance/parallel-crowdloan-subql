import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { ContributionEntity, SummaryEntity } from "../types";
import { Extrinsic } from "@polkadot/types/interfaces";
import type { Vec, Result, Null, Option } from "@polkadot/types";

const parseRemark = (remark: { toString: () => string }) => {
    logger.info(`Remark is ${remark.toString()}`);
    return Buffer.from(remark.toString().slice(2), "hex").toString("utf8");
};

const checkTransaction = (sectionFilter: string, methodFilter: string, call: Extrinsic) => {
    const { section, method } = api.registry.findMetaCall(call.callIndex);
    return section === sectionFilter && method === methodFilter;
};


export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    const calls = extrinsic.extrinsic.args[0] as Vec<Extrinsic>;
    if (
        calls.length !== 2 ||
        !checkTransaction("system", "remark", calls[0]) ||
        !checkTransaction("crowdloans", "contribute", calls[1])
    ) {
        return;
    }
    const [
        {
            args: [remarkRaw],
        },
        {
            args: [paraIdRaw, amountRaw],
        },
    ] = calls.toArray();

    const [_paraId, referralCode] = parseRemark(remarkRaw).split("#");

    const contributionRecord = ContributionEntity.create({
        id: extrinsic.extrinsic.hash.toString(),

        blockHeight: extrinsic.block.block.header.number.toNumber(),
        paraId: parseInt(paraIdRaw.toString()),
        account: extrinsic.extrinsic.signer.toString(),
        amount: amountRaw.toString(),
        referralCode,
        timestamp: extrinsic.block.timestamp,
    });
    logger.info(JSON.stringify(contributionRecord));

    await contributionRecord.save();

    let summaryRecord = await SummaryEntity.get(paraIdRaw.toString());
    if (summaryRecord) {
        summaryRecord.contributions += 1;
        summaryRecord.amount = (BigInt(summaryRecord.amount) + BigInt(amountRaw.toString())).toString()
    } else {
        summaryRecord = SummaryEntity.create({
            id: paraIdRaw.toString(),
            contributions: 1,
            amount: amountRaw.toString(),
        });
    }
    logger.info(JSON.stringify(summaryRecord));

    await summaryRecord.save();
}
