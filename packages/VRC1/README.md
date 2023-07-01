## Deploy contract to the fantom mainnet

```shell

npx  hardhat  run  --network  fantom_mainnet  scripts/deploy.ts

```

## Deploy contract to the fantom testnet

```shell

npx  hardhat  run  --network  fantom_testnet  scripts/deploy.ts

```

## Run the fantom localnet

- You should have docker installed
- Start localnet and attach js-console to it:

```shell

docker  run  -p  5050:5050  -p  18545:18545  -p  19090:19090  -ti  catangent/opera:latest

```

- Check balance of one of 4 accounts:

```js
ftm.getBalance(ftm.accounts[4]);
```

- Send 1 token from one account to another:

```js
ftm.sendTransaction({
  from: ftm.accounts[1],

  to: ftm.accounts[2],

  value: web3.toWei(1.0, "ether"),
});
```

- To stop localnet, press ctrl-d.

- In order to use provided accounts in Metamask:
  1.  make sure you have localnet running
  2.  import the account to Metamask with the private key
  3.  add fantom localnet to Metamask:
      settings -> networks -> add network -> manually
      name: Fantom Localnet
      RPC URL: http://localhost:18545
      ID: 4003
      Currency symbol: FTM
  4.  clear activity (settings -> advanced -> clear activity tab data)

## Deploy contract to the fantom localnet

1. Start localnet

2. In second terminal, run:

```shell

npx  hardhat  run  --network  fantom_localnet  scripts/deploy.ts

```
