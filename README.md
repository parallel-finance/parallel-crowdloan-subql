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

### Yarn install the dependencies

```
yarn
```

### Generate schema types

```
yarn codegen
```

### Run build to make sure the project can built successfully

```
yarn build
```

### Publish project to IPFS

[IPFS deployment](https://doc.subquery.network/publish/ipfs/#) is the new way from subquery team to do the deployment.

Before publish, make sure run `yarn build` successfully.

#### Generate IPFS CID

- Publishing project For staging blockchain

  ```
  yarn ipfs:publish
  ```

- Publishing project for Heiko blockchain

  ```
  yarn ipfs:publish -f heiko.yaml
  ```

- Publishing project for Parallel blockchain

  TBD

The response should be as following:

```
Building and packing code... done
Uploading SupQuery project to IPFS
SubQuery Project uploaded to IPFS: <CID>
```

#### Deploy slot with IPFS `CID`

Go To subQuery project page, click Deploy button and enter the CID you previously get

- Staging: https://project.subquery.network/project/parallel-finance/staging-crowdloan-pallet
- Heiko: https://project.subquery.network/project/parallel-finance/crowdloan-via-heiko
- Parallel: TBD
