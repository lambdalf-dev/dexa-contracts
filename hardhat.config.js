require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-etherscan")
require("@nomicfoundation/hardhat-chai-matchers")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ process.env.ALCHEMY_API_KEY }`,
      accounts: [ process.env.DEV_PRIVATE_KEY ],
    },
    // mainnet: {
    //   url: `https://eth-mainnet.g.alchemy.com/v2/${ process.env.ALCHEMY_API_KEY }`,
    //   accounts: [ process.env.PRIVATE_KEY ],
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          viaIR: false,
          optimizer: {
            enabled: true,
            runs: 10000,
          },
          outputSelection: {
            "*": {
              "*": ["evm.assembly", "irOptimized"],
            },
          },
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    // outputFile: 'gas-report.txt',
  },
  mocha: {
    timeout: 200000,
  },
}
