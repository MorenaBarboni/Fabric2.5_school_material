/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */



const grpc = require('@grpc/grpc-js')
const { connect, Contract, Identity, Signer, signers } = require('@hyperledger/fabric-gateway')
const { Console } = require('console')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { TextDecoder } = require('util')

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

const channelName = envOrDefault('CHANNEL_NAME', 'q1channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'quotation');
const mspId = 'AgencyMSP';

// Path to crypto materials.
const cryptoPath = '/workspaces/Fabric2.5_school_material/test-network/organizations/peerOrganizations/agency.quotation.com/';

// Path to user private key directory.
const keyDirectoryPath = cryptoPath + 'users/User1@agency.quotation.com/msp/keystore'

// Path to user certificate.
const certPath = cryptoPath + '/users/User1@agency.quotation.com/msp/signcerts/User1@agency.quotation.com-cert.pem'

// Path to peer tls certificate.
const tlsCertPath = cryptoPath + 'peers/peer0.agency.quotation.com/tls/ca.crt';

// Gateway peer endpoint.
const peerEndpoint = 'localhost:11051'

// Gateway peer SSL host name override.
const peerHostAlias = 'peer0.agency.quotation.com'

const utf8Decoder = new TextDecoder();
const assetId = `asset${Date.now()}`;

async function newGrpcConnection() {
    const tlsRootCert = fs.readFileSync(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

function newIdentity() {
    const credentials = fs.readFileSync(certPath)
    return { mspId, credentials}
}

function newSigner() {
    const files = fs.readdirSync(keyDirectoryPath)
    const keyPath = path.resolve(keyDirectoryPath, files[0])
    const privateKeyPem = fs.readFileSync(keyPath)
    const privateKey = crypto.createPrivateKey(privateKeyPem)
    return signers.newPrivateKeySigner(privateKey)
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function submitT(channel, transactionName, transactionParams) {

    const client = await newGrpcConnection()
    console.log("gRPC Connection created")

    const id = newIdentity()
    const signer = newSigner()

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
        console.log("Connecting to the channel...")
        const network = gateway.getNetwork(channel)
        console.log("Getting the contract...")
        const contract = network.getContract('quotation')

        let resp = null
        if (!transactionParams || transactionParams === '') {
            resp = await contract.submitTransaction(transactionName)
        } else {
            resp = await contract.submitTransaction(transactionName, ...transactionParams)
        }

        console.log(resp.toString())

    } catch (err) {
        console.error(err)
    } finally {
        gateway.close()
        client.close()
    }

    console.log('*** Transaction committed successfully');
}

module.exports = { submitT }