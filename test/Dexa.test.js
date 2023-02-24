// **************************************
// *****           IMPORT           *****
// **************************************
  const chai = require(`chai`)
  const chaiAsPromised = require(`chai-as-promised`)
  chai.use(chaiAsPromised)
  const expect = chai.expect

  const { ethers } = require(`hardhat`)
  const { loadFixture } = require(`@nomicfoundation/hardhat-network-helpers`)

  const {
    INTERFACE_ID,
    shouldSupportInterface,
  } = require(`@lambdalf-dev/ethereum-contracts/test/utils/behavior.ERC165`)

  const {
    shouldBehaveLikeERC2981,
  } = require('@lambdalf-dev/ethereum-contracts/test/utils/behavior.ERC2981')

  const {
    shouldBehaveLikeERC173,
    shouldRevertWhenCallerIsNotContractOwner,
  } = require(`@lambdalf-dev/ethereum-contracts/test/utils/behavior.ERC173`)

  const {
    shouldRevertWhenArrayLengthsDontMatch,
  } = require(`@lambdalf-dev/ethereum-contracts/test/utils/behavior.Arrays`)

  const {
    shouldRevertWhenInvalidMaxSupply,
    shouldRevertWhenQtyIsZero,
    shouldRevertWhenQtyOverMaxBatch,
    shouldRevertWhenMintedOut,
    shouldRevertWhenReserveDepleted,
  } = require(`@lambdalf-dev/ethereum-contracts/test/utils/behavior.NFTSupply`)

  const {
    ERC1155ReceiverError,
    shouldEmitTransferSingleEvent,
    shouldEmitTransferBatchEvent,
    shouldEmitApprovalForAllEvent,
    shouldEmitURIEvent,
    shouldRevertWhenApprovingTokenOwner,
    shouldRevertWhenCallerIsNotApproved,
    shouldRevertWhenERC1155ReceiverRejectsTransfer,
    shouldRevertWhenNewSeriesAlreadyExist,
    shouldRevertWhenRequestedTokenDoesNotExist,
    shouldRevertWhenTokenOwnerDoesNotOwnEnoughTokens,
    shouldRevertWhenTransferingToNonERC1155ReceiverContract,
    shouldRevertWhenTransferingToNullAddress,
  } = require(`@lambdalf-dev/ethereum-contracts/test/ERC1155/behavior.ERC1155`)
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
  const CONTRACT_INTERFACE = {
    NAME: "Dexa",
    METHODS: {
      // **************************************
      // *****           PUBLIC           *****
      // **************************************
        // Dexa
        mintTo: {
          SIGNATURE: `mintTo(uint256,uint256,address)`,
          PARAMS: [`id_`, `qty_`, `recipient_`],
        },
        // IERC1155
        safeBatchTransferFrom: {
          SIGNATURE: `safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)`,
          PARAMS: [`from_`, `to_`, `ids_`, `amounts_`, `data_`],
        },
        safeTransferFrom: {
          SIGNATURE: `safeTransferFrom(address,address,uint256,uint256,bytes)`,
          PARAMS: [`from_`, `to_`, `id_`, `amount_`, `data_`],
        },
        setApprovalForAll: {
          SIGNATURE: `setApprovalForAll(address,bool)`,
          PARAMS: [`operator_`, `approved_`],
        },
      // **************************************

      // **************************************
      // *****       CONTRACT_OWNER       *****
      // **************************************
        // Dexa
        createSeries: {
          SIGNATURE: `createSeries(uint256,uint256)`,
          PARAMS: [`id_`, `maxSupply_`],
        },
        updateSeries: {
          SIGNATURE: `updateSeries(uint256,uint256)`,
          PARAMS: [`id_`, `remainingSupply_`],
        },
        setMinter: {
          SIGNATURE: `setMinter(uint256,address)`,
          PARAMS: [`id_`, `minter_`],
        },
        setRoyaltyInfo: {
          SIGNATURE: `setRoyaltyInfo(address,uint256)`,
          PARAMS: [`recipient_`, `royaltyRate_`],
        },
        setURI: {
          SIGNATURE: `setURI(string)`,
          PARAMS: [`uri_`],
        },
        // IERC173
        transferOwnership: {
          SIGNATURE: `transferOwnership(address)`,
          PARAMS: [`newOwner_`],
        },
        // OperatorFilterer
        updateOperatorFilterRegistryAddress: {
          SIGNATURE: `updateOperatorFilterRegistryAddress(address)`,
          PARAMS: [`newRegistry`],
        },
      // **************************************

      // **************************************
      // *****            VIEW            *****
      // **************************************
        // Dexa
        DEFAULT_SERIES_ID: {
          SIGNATURE: `DEFAULT_SERIES_ID()`,
          PARAMS: [],
        },
        DEFAULT_SUBSCRIPTION: {
          SIGNATURE: `DEFAULT_SUBSCRIPTION()`,
          PARAMS: [],
        },
        DEFAULT_OPERATOR_FILTER_REGISTRY: {
          SIGNATURE: `DEFAULT_OPERATOR_FILTER_REGISTRY()`,
          PARAMS: [],
        },
        minters: {
          SIGNATURE: `minters(uint256)`,
          PARAMS: [`id_`],
        },
        remainingSupplies: {
          SIGNATURE: `remainingSupplies(uint256)`,
          PARAMS: [`id_`],
        },
        // IERC165
        supportsInterface: {
          SIGNATURE: `supportsInterface(bytes4)`,
          PARAMS: [`interfaceId_`],
        },
        // IERC173
        owner: {
          SIGNATURE: `owner()`,
          PARAMS: [],
        },
        // IERC1155
        balanceOf: {
          SIGNATURE: `balanceOf(address,uint256)`,
          PARAMS: [`owner_`, `id_`], 
        },
        balanceOfBatch: {
          SIGNATURE: `balanceOfBatch(address[],uint256[])`,
          PARAMS: [`owners_`, `ids_`],
        },
        isApprovedForAll: {
          SIGNATURE: `isApprovedForAll(address,address)`,
          PARAMS: [`tokenOwner_`, `operator_`],
        },
        // IERC1155MetadataURI
        uri: {
          SIGNATURE: `uri(uint256)`,
          PARAMS: [`id_`],
        },
        // IERC2981
        ROYALTY_BASE: {
          SIGNATURE: `ROYALTY_BASE()`,
          PARAMS: [],
        },
        royaltyInfo         : {
          SIGNATURE: 'royaltyInfo(uint256,uint256)',
          PARAMS: ['tokenId_', 'salePrice_'],
        },
      // **************************************
    },
  }
  const TEST_DATA = {
    // TEST NAME
    NAME: `Dexa`,
    // INTERFACES
    INTERFACES: [
      `IERC165`,
      `IERC173`,
      `IERC1155`,
      `IERC1155MetadataURI`,
      `IERC2981`,
    ],
  }
  let users = {}
  let contract
// **************************************

// **************************************
// *****          FIXTURES          *****
// **************************************
  async function deployFixture() {
    const [
      test_contract_deployer,
      test_user1,
      test_user2,
      test_treasury,
      test_token_owner,
      test_other_owner,
      ...addrs
    ] = await ethers.getSigners()

    const contract_artifact = await ethers.getContractFactory(CONTRACT_INTERFACE.NAME)
    test_contract = await contract_artifact.deploy(test_treasury.address)
    await test_contract.deployed()

    return {
      test_user1,
      test_user2,
      test_contract,
      test_treasury,
      test_token_owner,
      test_other_owner,
      test_contract_deployer,
    }
  }
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
  // Errors
  async function shouldRevertWhenNotMinter (promise, contract, sender, id, error) {
    if (typeof error === 'undefined') {
      await expect(promise)
        .to.be.revertedWithCustomError(contract, `DEXA_NON_MINTER`)
        .withArgs(sender, id)
    }
    else {
      await expect(promise)
        .to.be.revertedWith(error)
    }
  }
// **************************************

// **************************************
// *****          TEST RUN          *****
// **************************************
describe(TEST_DATA.NAME, function () {
  if (true) {
    shouldSupportInterface(deployFixture, TEST_DATA.INTERFACES)
  }
})
