`/application/` -> Web Application built with an express server to interact with the chaincodes

`/assetTransferApplication/` -> Web Application built with an express server to interact with the chaincodes

`/bin/` -> Folder with all configuration files to build the Fabric Network (**DO NOT TOUCH!**)

`/chaincodes/` -> Folder with the chaincodes to deploy in the Fabric Network
- `/chaincodes/assetTransfer` -> chaincode for adding assets in the network
- `/chaincodes/quotation` -> chaincode for the creation and acceptance of networked quotations

`/config/` -> Folder to give a basic configuration to the network

`/test-network/` -> Folder with all necessary to start the network to use for the Winter School
- `/test-network/compose/` -> Folder with the docker configuration files
  - `/test-network/compose/compose-test-net.yaml` ->  File to define the docker containers for the *orderer node* and for all *peers*
- `/test-network/configtx/configtx.yaml` -> Configuration file to define the whole network like: policies, channels' profile, organizations, orderers
- `/test-network/organizations/` -> Folder with the the configurations file of each *peer* and *orderer* (created at runtime)
    -  `/test-network/organizations/cryptogen/` -> Folder to generate the cryptographic material needed for the network`
    - `/test-network/organizations/ccp-generate.sh` -> Script used to generate connection profiles for the organizations according to `ccp-template.json` and `ccp-template.yaml`
    - `/test-network/organizations/ccp-template.*` -> Templates to generate the connection profiles, the format "yaml" and "json" depends on the use case
- `/test-network/scripts/` -> Folder containing all scripts used with the network
    - `/test-network/scripts/ccutils.sh` -> Contains the methods to interact with the network through *invoke* or *query*
    - `/test-network/scripts/createChannelQ1.sh` -> Script for the creation of the channel *q1channel*
    - `/test-network/scripts/createChannelQ2.sh` -> Script for the creation of the channel *q2channel*
    - `/test-network/scripts/deployCC.sh` -> Script to handle the deploy of the chaincode in the network
    - `/test-network/scripts/envVar.sh` -> Script to set several environment variables of the *organizations*
    - `/test-network/scripts/orderer.sh` -> Script to set several environment variables of the *orderer*
    - `/test-network/scripts/packageCC.sh` -> This script is in charge of the *packaging* phase for the chaincode's deploy
- `/test-network/network.config` -> Sets all default values for the test network
- `/test-network/network.sh` -> Main script to use to interact with the network (start the network, create the channels, deploy the chaincodes, ...)
  
