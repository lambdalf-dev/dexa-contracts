const hre = require("hardhat")
require("dotenv").config()

async function main() {
  const CONTRACT_NAME = "Dexa"
  const ROYALTY_RECIPIENT = process.env.ROYALTY_RECIPIENT

  const artifact = await hre.ethers.getContractFactory(CONTRACT_NAME)
  const contract = await artifact.deploy(ROYALTY_RECIPIENT)
  await contract.deployed()
  console.log(`${ CONTRACT_NAME } deployed to: ${ contract.address }`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
