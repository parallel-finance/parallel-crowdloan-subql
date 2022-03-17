# Parallel Crowdloan Subql

Based on [SubQuery](https://www.subquery.network/) project defines for collect the crowdloan data from Heiko or Parallel Substrate blockchain

## Development

### Start project in Docker

```
docker-compose pull && docker-compose up
```

### Query data

open your browser and head to `http://localhost:3000`.

Finally, you should see a GraphQL playground is showing in the explorer and the schemas that ready to query.

```graphql
{
  query {
    contributions(first: 5) {
      nodes {
        id
        extrinsicHash
        vaultId
        blockHeight
      }
    }
    vaults(first: 5) {
      nodes {
        id
        createdAt
        paraId
        leaseStart
      }
    }
  }
}
```

## Deployment

We used [IPFS deployment](https://doc.subquery.network/publish/ipfs/#) from subQuery team provide.

Before do the deployment, make sure run `yarn build` successfully. And please check if the [genesisHash](https://doc.subquery.network/create/manifest/#custom-chains) in yaml file is correct for the blockchain you want to collect.

### Generate IPFS CID

Need to prepare your [SUBQL_ACCESS_TOKEN](https://doc.subquery.network/publish/ipfs/#prepare-your-subql-access-token) before call actions.

- For staging: Click `Run workflow` on [Deploy with staging RPC](https://github.com/parallel-finance/parallel-crowdloan-subql/actions/workflows/deploy-staging.yml) action, and enter the `SUBQL_ACCESS_TOKEN`, then click the button again.
- For Heiko: Click `Run workflow` on [Deploy with Heiko RPC](https://github.com/parallel-finance/parallel-crowdloan-subql/actions/workflows/deploy-heiko.yml) action, and enter the `SUBQL_ACCESS_TOKEN`, then click the button again.

- For Parallel: TBD

### Get IPFS CID from github action

The check the response in deployment action `Publish to IPFS` step, for [example](https://github.com/parallel-finance/parallel-crowdloan-subql/runs/5580416630?check_suite_focus=true), there should be as following:

```
Building and packing code... done
Uploading SupQuery project to IPFS
SubQuery Project uploaded to IPFS: <CID>
```

Use `CID` for next step.

### Deploy slot with IPFS `CID`

Go To subQuery project page, click Deploy button for staging slot and enter the CID you previously get. After staging finished deployment and everything looks good. Click `Promote to production` deploy the changes to production slot.

- Staging: https://project.subquery.network/project/parallel-finance/staging-crowdloan-pallet
- Heiko: https://project.subquery.network/project/parallel-finance/crowdloan-via-heiko
- Parallel: TBD
