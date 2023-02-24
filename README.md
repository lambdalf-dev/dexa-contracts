# Dexa Contracts

A repository to store the contracts for the Dexa ticketing system

## Installation

`yarn` Install the repository and necessary dependencies
`yarn upgrade` Upgrade the list of dependencies

## Usage

- `npx hardhat help` Displays the user manual
- `npx hardhat test` Runs the test suite
- `npx hardhat coverage` Runs the test suite and generates a coverage report
- `npx hardhat flatten <filename> > <filename flattened>` Flattens a contract
- `npx hardhat run scripts/deploy.js --network <networkName>` Runs deployment script for the given network
- `npx hardhat verify <contractAddress> --network <networkName>` Verifies the contract at the given address on the given network
