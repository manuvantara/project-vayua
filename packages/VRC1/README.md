# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

Do not forget to create .env file and specify PRIVATE_KEY

To deploy Profile contract to the Theta testnet run

```shell
npx hardhat run scripts/deploy.ts --network theta_testnet
```

To deploy Profile contract to the Theta mainnet run

```shell
npx hardhat run scripts/deploy.ts --network theta_mainnet
```
