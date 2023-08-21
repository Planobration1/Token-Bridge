# Project Setup and Deployment Instructions

The project is divided into two folders: `contracts` and `script`.
Create a .env file at the root directory of this repo and fill it with the variables naming from the .env.example
Each script execution occurs at the child directory: contracts and script

## Smart Contracts Deployment

1. **Smart Contracts (BSC Testnet and TRX)**:
   `cd contracts` *to get to the child directory*
   - Deploy the smart contracts (written in Hardhat) to both BSC and TRX networks.
   - `npm run compile` > Compile the contracts
   - Deploy BSC Contract
      - `npm run deploy_bsc` > You will get the contract address in the console and also in the `deployments.txt` file 
      - `npm run verify_bsc` > Verify the contract on BSCScan
   - Deploy TRX Contract
      - `npm run deploy_trc` > You will get the contract address in the console and also in the `deployments.txt` file 
   - Flatten the code
      - `npm run flatten` > Flatten the code and saved in `flat.sol`
   - Flattened code can be used to verify the smart contracts on individual chains

## Hosting and Running the Script

1. **Testnet Deployment**:
   - Update the config.js file with BSC and TRC bridge addresses.
   - `npm run start` > Start the script
   - Import `prodConfig` instead of `testConfig` in the following files: `bridge.js`, `contracts.js`, and `app.js`.
   - Deploy the script on Railway with the same configurations.

2. **Main Script Execution**:
   - The main script logic is in `app.js`.
   - Install packages with `yarn install` or npm
   - Set `devEnv` to `false` in the `config.js` file located in the `script` directory.
   - Run the script using the command `node app.js`.
   - Confirm that the script executes as expected.

3. **Main Script Execution**:
   - Update the contract address in the frontend `consts.js` file.
   - Also set `const isTestNet = false`
