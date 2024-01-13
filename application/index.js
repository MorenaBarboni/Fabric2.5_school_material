/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
const grpc = require('@grpc/grpc-js')
const { connect, signers } = require('@hyperledger/fabric-gateway')
const { Console } = require('console')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { TextDecoder } = require('util')

// Path to crypto materials.
const cryptoPath = '/workspaces/Fabric2.5_school_material/test-network/organizations/peerOrganizations/';

// Gateway peer endpoint.
const peerEndpoint = 'localhost:11051'

const utf8Decoder = new TextDecoder();

/**
 * Establish client-gateway gRPC connection
 * @param {String} organization | organization domain
 * @returns gRPC client
 */
async function newGrpcConnection(organization) {
    // Gateway peer SSL host name override.
    const peerHostAlias = `peer0.${organization}`
    // Path to peer tls certificate.
    const tlsCertPath = path.join(cryptoPath, `${organization}/peers/${peerHostAlias}/tls/ca.crt`)
    console.log(tlsCertPath);

    const tlsRootCert = fs.readFileSync(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);


    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

/**
 * Create a new user identity
 * @param {String} organization | organization domain
 * @param {String} mspId | organizazion MSP ID
 * @returns the user credentials
 */
function newIdentity(organization, mspId) {
    // Path to user certificate
    const certPath = path.join(cryptoPath, `${organization}/users/User1@${organization}/msp/signcerts/User1@${organization}-cert.pem`)

    const credentials = fs.readFileSync(certPath);
    return { mspId, credentials }
}

/**
 * Create a signing implementation
  * @param {String} organization | organization domain
  * @returns a new signing implementation for the user
 */
function newSigner(organization) {
    // Path to user private key directory.
    const keyDirectoryPath = path.join(cryptoPath, `${organization}/users/User1@${organization}/msp/keystore`)

    const files = fs.readdirSync(keyDirectoryPath)
    const keyPath = path.resolve(keyDirectoryPath, files[0])
    const privateKeyPem = fs.readFileSync(keyPath)
    const privateKey = crypto.createPrivateKey(privateKeyPem)
    return signers.newPrivateKeySigner(privateKey)
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
  * @param {String} organization | organization domain
  * @param {String} channel | channel name
  * @param {String} chaincode | chaincode name 
  * @param {String} mspId | organization mspID 
  * @param {String} transactionName | transaction method
  * @param {Array} transactionParams | transaction parameters
  * @returns a new signing implementation for the user
 */
async function submitT(organization, channel, chaincode, mspId, transactionName, transactionParams) {

    organization = organization.toLowerCase()

    //Establish gRPC connection
    console.log("Creating gRPC connection...")
    const client = await newGrpcConnection(organization)

    console.log("Retrieving user identity...")
    //Retrieve User1's identity
    const id = newIdentity(organization, mspId)
    //Retrieve signing implementation
    const signer = newSigner(organization)

    console.log("Connecting Gateway...")
    //Connect gateway
    const gateway = connect({
        client,
        identity: id,
        signer: signer,
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    })

    try {
        console.log(`Connecting to ${channel} ...`)
        const network = gateway.getNetwork(channel)

        console.log(`Getting the ${chaincode} contract ...`)
        const contract = network.getContract(chaincode)

        console.log(`Submitting ${transactionName} transaction ...\n`)

        let resp = null
        if (!transactionParams || transactionParams === '') {
            resp = await contract.submitTransaction(transactionName)
        } else {
            resp = await contract.submitTransaction(transactionName, ...transactionParams)
        }


        const resultJson = utf8Decoder.decode(resp);
        const result = JSON.parse(resultJson);
        console.log('*** Result:', result);
        console.log('*** Transaction committed successfully');


    } catch (err) {
        console.error(err)
    } finally {
        gateway.close()
        client.close()
    }

}

module.exports = { submitT }