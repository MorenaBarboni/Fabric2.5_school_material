[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# Basic commands to interact with the network

- Move inside to the *test-network* folder:
```
cd ./test-network
```

- To start the network:
```
./network.sh up
```

- To create the channels (if you execute this command without `./network.sh up` the script will start the network before creating the channels):
```
./network.sh createChannel
```

- To deploy a chaincode:
```
./network.sh deployCC -ccn chaincode_name
```

- To invoke a method of a chaincode:
  - if the chaincode requires params
```
./network.sh cc invoke -ccn chaincode_name -c channel_name -org organization_number -ccic '"methodName","params1","params2",...,"paramsN"'
```
  - if the chaincode doesn't require any param
```
./network.sh cc invoke -ccn chaincode_name -c channel_name -org organization_number -ccic '"methodName"'
```

- To make a query to the chaincode:
```
./network.sh cc query -ccn chaincode_name -c channel_name -org organization_number -ccqc '"methodName"'
```

- To shut down the network by cleaning it:
```
./network.sh down
```
