# convector-rest-api

This project aims to provide an easy way for generating automatically client API for Convector projects.

For showing and explaining how it works we'll start from the SupplyChain example that you can find here: https://github.com/xcottos/convector-example-supplychain-master and we'll generate automatically the client API.

First clone the SupplyChain project:

```
git clone https://github.com/xcottos/convector-example-supplychain-master
```

I am not explaining again here how the project works and its internals (you can find it in the project docs)

## Dependencies

The first thing we need to do is to change the **lerna.json** of the project in order to exclude from the hoisting the @types/bytebuffer. This will prevent exceptions in the future compilation of the API application.
The lerna.json should look like:

```
{
  "packages": [
    "packages/*"
  ],
  "version": "0.1.0",
  "command": {
    "bootstrap": {
      "hoist": true,
      "nohoist":[
        "@types/bytebuffer"
      ]
    }
  }
}
```

The next step is adding as a **dependency** the package **convector-rest-api-decorators** in the **package.json** of the chaincode that is located in **packages/< chaincode name >-cc/**. In the supplychain example this is located in the **convector-example-supplychain-master/packages/supplychainchaincode-cc** folder that contains the code of our chaincode.

So the **package.json** will be:

```javascript
{
  "name": "supplychainchaincode-cc",
  "version": "0.1.0",
  "description": "Chaincodes package for testnewchaincode",
  "main": "./dist/src/index.js",
  "typings": "./dist/src/index.d.ts",
  "files": [
    "dist/*"
  ],
  "scripts": {
    "clean": "rimraf dist client",
    "build": "npm run clean && tsc",
    "prepare": "npm run build",
    "test": "npm run build && mocha -r ts-node/register tests/*.spec.ts --reporter spec"
  },
  "dependencies": {
    "yup": "^0.26.6",
    "reflect-metadata": "^0.1.12",
    "@worldsibu/convector-core": "~1.3.0",
    "@worldsibu/convector-platform-fabric": "~1.3.0",
    "@worldsibu/convector-rest-api-decorators": "1.0.5"
  },
  "devDependencies": {
    "@types/node": "^10.12.5",
    "@worldsibu/convector-storage-couchdb": "~1.3.0",
    "rimraf": "^2.6.2",
    "ts-node": "^8.0.2",
    "mocha": "^5.0.3",
    "chai": "^4.1.2",
    "@types/mocha": "^5.2.5",
    "@types/chai": "^4.1.4"
  }
}

```

Now in the root of the project (in our scenario is **convector-example-supplychain-master**) you can run the command:

```
npm i
```
that will install all the dependencies (included the new one just introduced in the package.json) that we'll use in the next steps)

Now that the dependencies are installed we can pass to the configuration of the api generator that can be logically divided in:

+ Infrastructure configuration
+ API configuration

## Infrastructure configuration

For the **infrastructure configuration** you need to create a file in the root of the project (in our scenario is **convector-example-supplychain-master**) called **api.json** that contains the infrastructure parameters.

```javascript
{
  "selected":"dev",
  "environments": [
    {
      "name":"dev",
      "PORT":"3000",
      "LOG_LEVEL":"debug",
      "REQUEST_LIMIT":"100kb",
      "SESSION_SECRET":"mySecret",
      "SWAGGER_API_SPEC":"/spec",
      "KEYSTORE":"../../../fabric-hurl/.hfc-org1",
      "USERCERT":"admin",
      "ORGCERT":"org1",
      "NETWORKPROFILE":"../../../fabric-hurl/network-profiles/org1.network-profile.yaml",
      "CHANNEL":"ch1",
      "CHAINCODE":"supplychainchaincode",
      "COUCHDBVIEW":"ch1_supplychainchaincode",
      "COUCHDB_PORT":"5984",
      "COUCHDB_HOST":"localhost",
      "COUCHDB_PROTOCOL":"http"
    },
    {
      "name":"prod",
      "PORT":"3000",
      "LOG_LEVEL":"error",
      "REQUEST_LIMIT":"100kb",
      "SESSION_SECRET":"mySecret",
      "SWAGGER_API_SPEC":"/spec",
      "KEYSTORE":"../../../fabric-hurl/.hfc-org1",
      "USERCERT":"admin",
      "ORGCERT":"org1",
      "NETWORKPROFILE":"../../../fabric-hurl/network-profiles/org1.network-profile.yaml",
      "CHANNEL":"ch1",
      "CHAINCODE":"supplychainchaincode",
      "COUCHDBVIEW":"ch1_supplychainchaincode",
      "COUCHDB_PORT":"5984",
      "COUCHDB_HOST":"localhost",
      "COUCHDB_PROTOCOL":"http"
    }
  ]
}
```

In this file we defined 2 configurations that we named **dev** and **prod** and that represents respectively, the configuration for the development and the production environments.

The **selected** parameter contains the name of the environment that will be used during the API generation.

The other parameters are:

+ **PORT**: the port number of the server that will answer to the API requests.
+ **LOG_LEVEL**: the log level of the app. The app uses **pino** for the logging
+ **REQUEST_LIMIT**: the limit in kb of the request that can reach the API when invoked.
+ **SESSION_SECRET**: used to parse and match session cookies
+ **SWAGGER_API_SPEC**: `apiPath ` property of the Swagger. Location of the swagger docs
+ **KEYSTORE**: The folder that contains the hurl (Hyperledger Fabric) keystore.
+ **USERCERT**: the name of the hurl (Hyperledger Fabric) identity that will perform the API calls
+ **ORGCERT**: The organization of the **USERCERT** identity
+ **NETWORKPROFILE**: Location of the yaml file that contains the hurl (Hyperledger Fabric) network definition
+ **CHANNEL**: the channel of the peer the chaincode invoked is installed in
+ **CHAINCODE**: chaincode name
+ **COUCHDBVIEW**: name of the couchdb view
+ **COUCHDB_PORT**: the port where couhdb is in listening
+ **COUCHDB_HOST**: the host where couchdb is installed
+ **COUCHDB_PROTOCOL**: the protocol used by couchdb

**Attention:** for the **KEYSTORE** and the **NETWORKPROFILE** variables the paths you see above are not the most common paths since the supplychain example uses custom paths for hurley (passing the parameter **-p** during the invoke). So adjust these paths accordingly with your usage of hurley.

These last COUCHDB variables are not used yet.

## API configuration

The **API configuration** instead is achieved **annotating** the methods in the chaincode controller (usually located in **packages/< chaincode name >-cc/src folder**) with the following possibilities:

+ **@Create(< model class >)**: It tells the generator to consider this method as a **post** method for generating instances of the model which class is **<model class>**. For example in the controller file **packages/supplychainchaincode-cc/src/supplychainchaincode.controller.ts**:

```javascript
@Create('Supplier')
@Invokable()
public async createSupplier(
  @Param(Supplier)
  supplier: Supplier
) {
  await supplier.save();
}
```

The annotation tells the generator that the generated API method that will wrap the invocation of this method, will be a post method that will have as parameter and object of type **Supplier** and will create an instance of it once invoked

+ **@GetById(< model class >)** It tells the generator to consider this method as a **get** method for retrieving instances of the model which class is **<model class>**, and  passing as argument its **id**. For example:

```javascript
@GetById('Supplier')
@Invokable()
public async getSupplierById(
  @Param(yup.string())
  supplierId: string
)
{
  const supplier = await Supplier.getOne(supplierId);
  return supplier;
}
```

+ **@GetAll(< model class >)** It tells the generator to consider this method as a **get** method for retrieving all the instances of the model which class is **<model class>** For example:

```javascript
@GetAll('Supplier')
@Invokable()
public async getAllSuppliers()
{
  const storedSuppliers = await Supplier.getAll('io.worldsibu.Supplier');
  return storedSuppliers;
}
```

+ **@Service()** It tells the generator to consider this method as a **post** method that doesn't return any  result and will have as parameter an object that will contain as properties the parameters to be passed to the chaincode controller function. It will generate an API wrapper accordingly (it will be better explained once described the **router.ts** generated file and the **API.yaml** file).
For example:

```javascript
@Service()
@Invokable()
public async fetchRawMaterial(
  @Param(yup.string())
  supplierId: string,
  @Param(yup.number())
  rawMaterialSupply: number
) {
  const supplier = await Supplier.getOne(supplierId);
  supplier.rawMaterialAvailable = supplier.rawMaterialAvailable + rawMaterialSupply;
  await supplier.save();
}
```

In our supplychain scenario the resulting **supplychainchaincode.controller.ts** file will be:

```javascript
import * as yup from 'yup';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core-controller';

import { Supplier } from './Supplier.model';
import { Manufacturer } from './Manufacturer.model';
import { Distributor } from './Distributor.model';
import { Retailer } from './Retailer.model';
import { Customer } from './Customer.model';

import { GetById, GetAll, Create, Service } from '@worldsibu/convector-rest-api-decorators';

@Controller('supplychainchaincode')
export class SupplychainchaincodeController extends ConvectorController {

  @Create('Supplier')
  @Invokable()
  public async createSupplier(
    @Param(Supplier)
    supplier: Supplier
  ) {
    await supplier.save();
  }

  @Create('Manufacturer')
  @Invokable()
  public async createManufacturer(
    @Param(Manufacturer)
    manufacturer: Manufacturer
  ) {
    await manufacturer.save();
  }

  @Create('Distributor')
  @Invokable()
  public async createDistributor(
    @Param(Distributor)
    distributor: Distributor
  ) {
    await distributor.save();
  }

  @Create('Retailer')
  @Invokable()
  public async createRetailer(
    @Param(Retailer)
    retailer: Retailer
  ) {
    await retailer.save();
  }

  @Create('Customer')
  @Invokable()
  public async createCustomer(
    @Param(Customer)
    customer: Customer
  ) {
    await customer.save();
  }

  @GetAll('Supplier')
  @Invokable()
  public async getAllSuppliers()
  {
    const storedSuppliers = await Supplier.getAll<Supplier>();
    return storedSuppliers;
  }

  @GetById('Supplier')
  @Invokable()
  public async getSupplierById(
    @Param(yup.string())
    supplierId: string
  )
  {
    const supplier = await Supplier.getOne(supplierId);
    return supplier;
  }

  @GetAll('Manufacturer')
  @Invokable()
  public async getAllManufacturers()
  {
    const storedManufacturers = await Manufacturer.getAll<Manufacturer>();
    return storedManufacturers;
  }

  @GetById('Manufacturer')
  @Invokable()
  public async getManufacturerById(
    @Param(yup.string())
    manufacturerId: string
  )
  {
    const manufacturer = await Manufacturer.getOne(manufacturerId);
    return manufacturer;
  }

  @GetAll('Distributor')
  @Invokable()
  public async getAllDistributors()
  {
    const storedDistributors = await Distributor.getAll<Distributor>();
    return storedDistributors
  }

  @GetById('Distributor')
  @Invokable()
  public async getDistributorById(
    @Param(yup.string())
    distributorId: string
  )
  {
    const distributor = await Distributor.getOne(distributorId);
    return distributor;
  }

  @GetAll('Retailer')
  @Invokable()
  public async getAllRetailers()
  {
    const storedRetailers = await Retailer.getAll<Retailer>();
    return storedRetailers;
  }

  @GetById('Retailer')
  @Invokable()
  public async getRetailerById(
    @Param(yup.string())
    retailerId: string
  )
  {
    const retailer = await Retailer.getOne(retailerId);
    return retailer;
  }

  @GetAll('Customer')
  @Invokable()
  public async getAllCustomers()
  {
    const storedCustomers = await Customer.getAll<Customer>();
    return storedCustomers;
  }

  @GetById('Customer')
  @Invokable()
  public async getCustomerById(
    @Param(yup.string())
    customerId: string
  )
  {
    const customer = await Customer.getOne(customerId);
    return customer;
  }

  @Invokable()
  public async getAllModels()
  {
    const storedCustomers = await Customer.getAll<Customer>();
    console.log(storedCustomers);

    const storedRetailers = await Retailer.getAll<Retailer>();
    console.log(storedRetailers);

    const storedDistributors = await Distributor.getAll<Distributor>();
    console.log(storedDistributors);

    const storedManufacturers = await Manufacturer.getAll<Manufacturer>();
    console.log(storedManufacturers);

    const storedSuppliers = await Supplier.getAll<Supplier>();
    console.log(storedSuppliers);
  }

  @Service()
  @Invokable()
  public async fetchRawMaterial(
    @Param(yup.string())
    supplierId: string,
    @Param(yup.number())
    rawMaterialSupply: number
  ) {
    const supplier = await Supplier.getOne(supplierId);
    supplier.rawMaterialAvailable = supplier.rawMaterialAvailable + rawMaterialSupply;
    await supplier.save();
  }

  @Service()
  @Invokable()
  public async getRawMaterialFromSupplier(
    @Param(yup.string())
    manufacturerId: string,
    @Param(yup.string())
    supplierId: string,
    @Param(yup.number())
    rawMaterialSupply: number
  ) {
    const supplier = await Supplier.getOne(supplierId);
    supplier.rawMaterialAvailable = supplier.rawMaterialAvailable - rawMaterialSupply;
    const manufacturer = await Manufacturer.getOne(manufacturerId);
    manufacturer.rawMaterialAvailable = rawMaterialSupply + manufacturer.rawMaterialAvailable;

    await supplier.save();
    await manufacturer.save();
  }

  @Service()
  @Invokable()
  public async createProducts(
    @Param(yup.string())
    manufacturerId: string,
    @Param(yup.number())
    rawMaterialConsumed: number,
    @Param(yup.number())
    productsCreated: number
  ) {
    const manufacturer = await Manufacturer.getOne(manufacturerId);
    manufacturer.rawMaterialAvailable = manufacturer.rawMaterialAvailable - rawMaterialConsumed;
    manufacturer.productsAvailable = manufacturer.productsAvailable + productsCreated;
    await manufacturer.save();
  }

  @Service()
  @Invokable()
  public async sendProductsToDistribution(
    @Param(yup.string())
    manufacturerId: string,
    @Param(yup.string())
    distributorId: string,
    @Param(yup.number())
    sentProducts: number
  ) {
    const distributor = await Distributor.getOne(distributorId);
    distributor.productsToBeShipped = distributor.productsToBeShipped + sentProducts;
    const manufacturer = await Manufacturer.getOne(manufacturerId);
    manufacturer.productsAvailable = manufacturer.productsAvailable - sentProducts;

    await distributor.save();
    await manufacturer.save();
  }

  @Service()
  @Invokable()
  public async orderProductsFromDistributor(
    @Param(yup.string())
    retailerId: string,
    @Param(yup.string())
    distributorId: string,
    @Param(yup.number())
    orderedProducts: number
  ) {
    const retailer = await Retailer.getOne(retailerId);
    retailer.productsOrdered = retailer.productsOrdered + orderedProducts;
    const distributor = await Distributor.getOne(distributorId);
    distributor.productsToBeShipped = distributor.productsToBeShipped - orderedProducts;
    distributor.productsShipped = distributor.productsShipped + orderedProducts;

    await retailer.save();
    await distributor.save();
  }

  @Service()
  @Invokable()
  public async receiveProductsFromDistributor(
    @Param(yup.string())
    retailerId: string,
    @Param(yup.string())
    distributorId: string,
    @Param(yup.number())
    receivedProducts: number
  ) {
    const retailer = await Retailer.getOne(retailerId);
    retailer.productsAvailable = retailer.productsAvailable + receivedProducts;
    const distributor = await Distributor.getOne(distributorId);
    distributor.productsReceived = distributor.productsReceived + receivedProducts;

    await retailer.save();
    await distributor.save();
  }

  @Service()
  @Invokable()
  public async buyProductsFromRetailer(
    @Param(yup.string())
    retailerId: string,
    @Param(yup.string())
    customerId: string,
    @Param(yup.number())
    boughtProducts: number
  ) {
    const retailer = await Retailer.getOne(retailerId);
    retailer.productsAvailable = retailer.productsAvailable - boughtProducts;
    retailer.productsSold = retailer.productsSold + boughtProducts;
    const customer = await Customer.getOne(customerId);
    customer.productsBought = customer.productsBought + boughtProducts;

    await retailer.save();
    await customer.save();
  }
}
```

## API generation

Once defined the infrastructure and once annotated the controller methods, we need to install the yeoman (https://yeoman.io) generator that will be used for creating the skeleton of our backend:

```
npm install -g generator-express-no-stress-typescript
```

Then we can install the **convector-rest-api** npm package (you can install it also directly from this project if you have in mind to develop and to change it)

```
npm install -g @worldsibu/convector-rest-api
```

This will install in your PATH an executable called **conv-rest-api**.

Now to generate the API application you just need to go in the root of your project and run:

```
conv-rest-api generate api -c <chaincode name> -p <project name> -f <chaincode config file>
```

While the chaincode name parameter will tell the generator where to look for the methods to be wrapped by APIs, the project name will be used only for defining the name of the project swagger and to give to the Router class a proper name. The chaincode config file is optional and defaults to the file in the root folder called **org1.< chaincode name >.config.json**

For our supply chain example we can run in the folder **convector-example-supplychain-master**:

```
conv-rest-api generate api -c supplychainchaincode -p supplychain -f ./org1.supplychainchaincode.config.json
```

What this command will do is:

+ Removing the previously generated app (if exists).
+ It invokes the yeoman generator for generating in the **packages** folder the stub of the api application in a folder called <chaoncode name>-app. In our supply chain scenario the folder will be called supplychainchaincode-app
+ It installs some external dependencies
+ It installs the chaincode as dependency of the project
+ It copies a **tsconfig.ts** file bundled in the **convector-rest-api** package in the root folder of the api project (**packages/supplychainchaincode-app**). This file is identical to the file that the **generator-express-no-stress-typescript** yeoman generator generates, with the difference that we added the **experimental decorators**:
```javascript
{
  "compileOnSave": false,
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "esModuleInterop": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "outDir": "dist",
    "typeRoots": ["node_modules/@types"]
  },
  "include": ["typings.d.ts", "server/**/*.ts"],
  "exclude": ["node_modules"]
}
```
+ It copies a file called **selfgenfabriccontext.ts** bundled in the **convector-rest-api** package, in **packages/<chaincode name>-app/server/selfgenfabriccontext.ts**. This file contains the environment variables and helper that will be used to interact with the fabric-client and the function getClient() that instantiates the Client object from the fabric-client library and configures it reading the files which names are specified using a variable present in the .env file we created above.

  We read 3 variables that in the supplychain example are:
  ```
  KEYSTORE=../../../fabric-hurl/.hfc-org1
  USERCERT=admin
  ORGCERT=org1
  ```

  the complete generated file is:

```javascript
/** Referenced from: https://github.com/ksachdeva/hyperledger-fabric-example/blob/c41fcaa352e78cbf3c7cfb210338ac0f20b8357e/src/client.ts */
import * as fs from 'fs';
import { join } from 'path';
import Client from 'fabric-client';

import { IEnrollmentRequest, IRegisterRequest } from 'fabric-ca-client';

export type UserParams = IRegisterRequest;
export type AdminParams = IEnrollmentRequest;

export namespace SelfGenContext {

  interface IdentityFiles {
    privateKey: string;
    signedCert: string;
  }

  export async function getClient() {
    // Check if needed
    let contextPath = '';
    if (process.env.KEYSTORE[0] == '/') {
       contextPath = join(process.env.KEYSTORE + '/' + process.env.USERCERT);
    }
    else {
       contextPath = join(__dirname, process.env.KEYSTORE + '/' + process.env.USERCERT);
    }

    fs.readFile(contextPath, 'utf8', async function (err, data) {
      if (err) {
        // doesnt exist! Create it.
        const client = new Client();

        console.log('Setting up the cryptoSuite ..');

        // ## Setup the cryptosuite (we are using the built in default s/w based implementation)
        const cryptoSuite = Client.newCryptoSuite();
        cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
          path: process.env.KEYSTORE
        }));

        client.setCryptoSuite(cryptoSuite);

        console.log('Setting up the keyvalue store ..');

        // ## Setup the default keyvalue store where the state will be stored
        const store = await Client.newDefaultKeyValueStore({
          path: process.env.KEYSTORE
        });

        client.setStateStore(store);

        console.log('Creating the admin user context ..');

        const privateKeyFile = fs.readdirSync(process.env.KEYSTORE + '/keystore')[0];

        // ###  GET THE NECESSRY KEY MATERIAL FOR THE ADMIN OF THE SPECIFIED ORG  ##
        const cryptoContentOrgAdmin: IdentityFiles = {
          privateKey: process.env.KEYSTORE + '/keystore/' + privateKeyFile,
          signedCert: process.env.KEYSTORE + '/signcerts/cert.pem'
        };

        await client.createUser({
          username: process.env.USERCERT,
          mspid: `${process.env.ORGCERT}MSP`,
          cryptoContent: cryptoContentOrgAdmin,
          skipPersistence: false
        });

        return client;
      } else {
        console.log('Context exists');
      }
    });

  }

}
```

+ It generates the file **packages/< chaincode name >-app/server/smartContractControllers.ts** where we the fabric adapter is configured and then, to call the blockchain, it's reused the SupplychainchaincodeControllerClient that was created automatically before when the convictor project was generated.
In the supplychain scenario the generated file will be:

```javascript
import { resolve } from "path";
import { ClientFactory } from "@worldsibu/convector-core-adapter";
import { SelfGenContext } from "./selfgenfabriccontext";
import { SupplychainchaincodeController } from "supplychainchaincode-cc/dist/src";
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';

export namespace SupplychainchaincodeControllerClient  {
    export async function init(): Promise<SupplychainchaincodeController> {
        const user = process.env.USERCERT || 'user1';
        await SelfGenContext.getClient();
        // Inject a Adapter of type *Fabric Controller*
        // Setup accordingly to the
        const adapter = new FabricControllerAdapter({
            txTimeout: 300000,
            user: user,
            channel: process.env.CHANNEL,
            chaincode: process.env.CHAINCODE,
            keyStore: resolve(__dirname, process.env.KEYSTORE),
            networkProfile: resolve(__dirname, process.env.NETWORKPROFILE),
            userMspPath: resolve(__dirname, process.env.KEYSTORE),
        });
        await adapter.init();
        // Return your own implementation of the controller

        return ClientFactory(SupplychainchaincodeController, adapter);
    }
}
```

**NOTE:** Here you can note the usage of the new pattern that uses the **ClientFactory** that finally removes the need of generating a client class since it allows to invoke directly the chaincode controller methods.

What we did here is defining an object called SupplyChainController that has a function init() that reads the USERCERT variable from the .env file, and creates the client that we defined above. Then it creates a FabricControllerAdapter reading the CHANNEL, the CHAINCODE and other parameters read from .env. Once configured the adapter ini initiated with the init() invocation.

+ It generates the file **packages/< chaincode name >-app/server/smartContractModels.ts** hat will export the names of the Models using the ones defined in the client directory. This class will be used in the controller client that will be described shortly:

In out supplychain scenario the generated file will be:
```javascript
import { BaseStorage } from '@worldsibu/convector-core-storage';
import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';

import { Customer as CustomerModel } from 'supplychainchaincode-cc/dist/src';
import { Distributor as DistributorModel } from 'supplychainchaincode-cc/dist/src';
import { Manufacturer as ManufacturerModel } from 'supplychainchaincode-cc/dist/src';
import { Retailer as RetailerModel } from 'supplychainchaincode-cc/dist/src';
import { Supplier as SupplierModel } from 'supplychainchaincode-cc/dist/src';

export namespace Models {
  export const Customer = CustomerModel;
  export const Distributor = DistributorModel;
  export const Manufacturer = ManufacturerModel;
  export const Retailer = RetailerModel;
  export const Supplier = SupplierModel;
}

```

+ It generates the controller client in **packages/< chaincode name >-app/server/api/controllers/examples/controller.ts** based on how the methods have been annotated in the chaincode controller
In the supplychain scenario the generated file is:

```javascript
import { Request, Response } from 'express';
import { SupplychainchaincodeControllerClient } from '../../../smartContractControllers';
import { Models } from '../../../smartContractModels';

export class Controller {

  async supplychainchaincode_getAllSuppliers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getAllSuppliers();
    res.json(result);
  }

  async supplychainchaincode_getAllManufacturers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getAllManufacturers();
    res.json(result);
  }

  async supplychainchaincode_getAllDistributors(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getAllDistributors();
    res.json(result);
  }

  async supplychainchaincode_getAllRetailers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getAllRetailers();
    res.json(result);
  }

  async supplychainchaincode_getAllCustomers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getAllCustomers();
    res.json(result);
  }


  async supplychainchaincode_getSupplierById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getSupplierById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async supplychainchaincode_getManufacturerById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getManufacturerById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async supplychainchaincode_getDistributorById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getDistributorById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async supplychainchaincode_getRetailerById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getRetailerById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async supplychainchaincode_getCustomerById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeControllerClient.init();
    let result = await cntrl.getCustomerById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async supplychainchaincode_createSupplier(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let modelRaw = req.body;
      let model = new Models.Supplier(modelRaw);
      await cntrl.createSupplier(model);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_createManufacturer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let modelRaw = req.body;
      let model = new Models.Manufacturer(modelRaw);
      await cntrl.createManufacturer(model);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_createDistributor(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let modelRaw = req.body;
      let model = new Models.Distributor(modelRaw);
      await cntrl.createDistributor(model);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_createRetailer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let modelRaw = req.body;
      let model = new Models.Retailer(modelRaw);
      await cntrl.createRetailer(model);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_createCustomer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let modelRaw = req.body;
      let model = new Models.Customer(modelRaw);
      await cntrl.createCustomer(model);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_fetchRawMaterial(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.fetchRawMaterial(params.supplierId,params.rawMaterialSupply);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_getRawMaterialFromSupplier(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.getRawMaterialFromSupplier(params.manufacturerId,params.supplierId,params.rawMaterialSupply);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_createProducts(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.createProducts(params.manufacturerId,params.rawMaterialConsumed,params.productsCreated);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_sendProductsToDistribution(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.sendProductsToDistribution(params.manufacturerId,params.distributorId,params.sentProducts);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_orderProductsFromDistributor(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.orderProductsFromDistributor(params.retailerId,params.distributorId,params.orderedProducts);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_receiveProductsFromDistributor(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.receiveProductsFromDistributor(params.retailerId,params.distributorId,params.receivedProducts);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async supplychainchaincode_buyProductsFromRetailer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeControllerClient.init();
      let params = req.body;

      await cntrl.buyProductsFromRetailer(params.retailerId,params.customerId,params.boughtProducts);
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }


}
export default new Controller();

```

+ It generates the file **packages/< chaincode name >-app/server/routes.ts** where the base route for our API is defined.
In our supplychain case is /api/v1/supplychain:

```javascript
import { Application } from 'express';
import supplychainRouter from './api/controllers/examples/router'
export default function routes(app: Application): void {
  app.use('/api/v1/supplychain', supplychainRouter);
};
```

+ It generates the **packages/< chainchode name >-app/server/api/controllers/examples/router.ts** that contains the **routes** of all the API. It's generated accordingly to the annotations put in the chaincode controller.

That means that:

+ **@Create** methods: will be mapped to POST methods where as convention the endpoint will be the name of the model class of the model that will be created with the first letter lowercase and with an 's' at the end; for example ```.post('/suppliers/', controller.createSupplier)```
+ **@GetAll** methods: will be mapped to GET methods where, as the previous one, the endpoint will be the name of the model class of all the instances that will be retrieved with the first letter lowercase and with an 's' at the end; for example ```.get('/suppliers/', controller.getAllSuppliers)```
+ **@GetById** methods: will be mapped to GET methods where, as the previous ones, the endpoint will be the name of the model class with the first letter lowercase and with an 's' at the end and the parameter will be the id of the model to be retrieved; for example ```.get('/suppliers/:id', controller.getSupplierById)```
+ **@Service** methods: will be mapped to POST methods where as convention the endpoint will be the name of the methods and all the parameters will be passed inside an object; For example: ```.post('/fetchRawMaterial', controller.fetchRawMaterial)```
And a sample object to be passed will be:
```
{
  "supplierId": "SPL_1",
  "rawMaterialSupply": 12345555
}
```

In the supplychain example the complete file will be:

```javascript
import express from 'express';
import controller from './controller'
export default express.Router()

    .post('/suppliers/', controller.supplychainchaincode_createSupplier)
    .post('/manufacturers/', controller.supplychainchaincode_createManufacturer)
    .post('/distributors/', controller.supplychainchaincode_createDistributor)
    .post('/retailers/', controller.supplychainchaincode_createRetailer)
    .post('/customers/', controller.supplychainchaincode_createCustomer)
    .get('/suppliers/', controller.supplychainchaincode_getAllSuppliers)
    .get('/manufacturers/', controller.supplychainchaincode_getAllManufacturers)
    .get('/distributors/', controller.supplychainchaincode_getAllDistributors)
    .get('/retailers/', controller.supplychainchaincode_getAllRetailers)
    .get('/customers/', controller.supplychainchaincode_getAllCustomers)
    .get('/suppliers/:id', controller.supplychainchaincode_getSupplierById)
    .get('/manufacturers/:id', controller.supplychainchaincode_getManufacturerById)
    .get('/distributors/:id', controller.supplychainchaincode_getDistributorById)
    .get('/retailers/:id', controller.supplychainchaincode_getRetailerById)
    .get('/customers/:id', controller.supplychainchaincode_getCustomerById)
    .post('/fetchRawMaterial', controller.supplychainchaincode_fetchRawMaterial)
    .post('/getRawMaterialFromSupplier', controller.supplychainchaincode_getRawMaterialFromSupplier)
    .post('/createProducts', controller.supplychainchaincode_createProducts)
    .post('/sendProductsToDistribution', controller.supplychainchaincode_sendProductsToDistribution)
    .post('/orderProductsFromDistributor', controller.supplychainchaincode_orderProductsFromDistributor)
    .post('/receiveProductsFromDistributor', controller.supplychainchaincode_receiveProductsFromDistributor)
    .post('/buyProductsFromRetailer', controller.supplychainchaincode_buyProductsFromRetailer)

;


```

+ Then it generates the **packages/< chaincode name >-app/server/common/swagger/Api.yaml** in order to use swagger for interacting with the APIs in a graphical way.

In our supplychain scenario the file generated will be the following:

```
swagger: "2.0"
info:
  version: 1.0.0
  title: supplychain
  description: supplychain REST API Application
basePath: /api/v1/supplychain

tags:

  - name: Customers
    description: Simple customer endpoints

  - name: Distributors
    description: Simple distributor endpoints

  - name: Manufacturers
    description: Simple manufacturer endpoints

  - name: Retailers
    description: Simple retailer endpoints

  - name: Suppliers
    description: Simple supplier endpoints


consumes:
  - application/json
produces:
  - application/json

definitions:

    CustomerBody:
      type: object
      title: Customer
      required:
         - id
         - name
         - productsBought
      properties:
        id:
          type: string
          example: a_text
        name:
          type: string
          example: a_text
        productsBought:
          type: number
          example: 123
    DistributorBody:
      type: object
      title: Distributor
      required:
         - id
         - name
         - productsToBeShipped
         - productsShipped
         - productsReceived
      properties:
        id:
          type: string
          example: a_text
        name:
          type: string
          example: a_text
        productsToBeShipped:
          type: number
          example: 123
        productsShipped:
          type: number
          example: 123
        productsReceived:
          type: number
          example: 123
    ManufacturerBody:
      type: object
      title: Manufacturer
      required:
         - id
         - name
         - productsAvailable
         - rawMaterialAvailable
      properties:
        id:
          type: string
          example: a_text
        name:
          type: string
          example: a_text
        productsAvailable:
          type: number
          example: 123
        rawMaterialAvailable:
          type: number
          example: 123
    RetailerBody:
      type: object
      title: Retailer
      required:
         - id
         - name
         - productsOrdered
         - productsAvailable
         - productsSold
      properties:
        id:
          type: string
          example: a_text
        name:
          type: string
          example: a_text
        productsOrdered:
          type: number
          example: 123
        productsAvailable:
          type: number
          example: 123
        productsSold:
          type: number
          example: 123
    SupplierBody:
      type: object
      title: Supplier
      required:
         - id
         - name
         - rawMaterialAvailable
      properties:
        id:
          type: string
          example: a_text
        name:
          type: string
          example: a_text
        rawMaterialAvailable:
          type: number
          example: 123
    fetchRawMaterialBody:
       type: object
       title: fetchRawMaterialParams
       required:
          - supplierId
          - rawMaterialSupply
       properties:
         supplierId:
           type: string
           example: a_text
         rawMaterialSupply:
           type: number
           example: 123
    getRawMaterialFromSupplierBody:
       type: object
       title: getRawMaterialFromSupplierParams
       required:
          - manufacturerId
          - supplierId
          - rawMaterialSupply
       properties:
         manufacturerId:
           type: string
           example: a_text
         supplierId:
           type: string
           example: a_text
         rawMaterialSupply:
           type: number
           example: 123
    createProductsBody:
       type: object
       title: createProductsParams
       required:
          - manufacturerId
          - rawMaterialConsumed
          - productsCreated
       properties:
         manufacturerId:
           type: string
           example: a_text
         rawMaterialConsumed:
           type: number
           example: 123
         productsCreated:
           type: number
           example: 123
    sendProductsToDistributionBody:
       type: object
       title: sendProductsToDistributionParams
       required:
          - manufacturerId
          - distributorId
          - sentProducts
       properties:
         manufacturerId:
           type: string
           example: a_text
         distributorId:
           type: string
           example: a_text
         sentProducts:
           type: number
           example: 123
    orderProductsFromDistributorBody:
       type: object
       title: orderProductsFromDistributorParams
       required:
          - retailerId
          - distributorId
          - orderedProducts
       properties:
         retailerId:
           type: string
           example: a_text
         distributorId:
           type: string
           example: a_text
         orderedProducts:
           type: number
           example: 123
    receiveProductsFromDistributorBody:
       type: object
       title: receiveProductsFromDistributorParams
       required:
          - retailerId
          - distributorId
          - receivedProducts
       properties:
         retailerId:
           type: string
           example: a_text
         distributorId:
           type: string
           example: a_text
         receivedProducts:
           type: number
           example: 123
    buyProductsFromRetailerBody:
       type: object
       title: buyProductsFromRetailerParams
       required:
          - retailerId
          - customerId
          - boughtProducts
       properties:
         retailerId:
           type: string
           example: a_text
         customerId:
           type: string
           example: a_text
         boughtProducts:
           type: number
           example: 123

paths:

  /customers:
    get:
      tags:
        - Customers
      description: Fetch all customers
      responses:
        200:
          description: Returns all customers
    post:
      tags:
        - Customers
      description: Create a new customer
      parameters:
        - name: customer
          in: body
          description: a customer
          required: true
          schema:
            $ref: "#/definitions/CustomerBody"
      responses:
        201:
          description: Successful insertion of customers

  /customers/{id}:
    get:
      tags:
        - Customers
      parameters:
        - name: id
          in: path
          required: true
          description: The id of the customer to retrieve
          type: string
      responses:
        200:
          description: Return the customer with the specified id
        404:
          description: Customer not found
  /distributors:
    get:
      tags:
        - Distributors
      description: Fetch all distributors
      responses:
        200:
          description: Returns all distributors
    post:
      tags:
        - Distributors
      description: Create a new distributor
      parameters:
        - name: distributor
          in: body
          description: a distributor
          required: true
          schema:
            $ref: "#/definitions/DistributorBody"
      responses:
        201:
          description: Successful insertion of distributors

  /distributors/{id}:
    get:
      tags:
        - Distributors
      parameters:
        - name: id
          in: path
          required: true
          description: The id of the distributor to retrieve
          type: string
      responses:
        200:
          description: Return the distributor with the specified id
        404:
          description: Distributor not found
  /manufacturers:
    get:
      tags:
        - Manufacturers
      description: Fetch all manufacturers
      responses:
        200:
          description: Returns all manufacturers
    post:
      tags:
        - Manufacturers
      description: Create a new manufacturer
      parameters:
        - name: manufacturer
          in: body
          description: a manufacturer
          required: true
          schema:
            $ref: "#/definitions/ManufacturerBody"
      responses:
        201:
          description: Successful insertion of manufacturers

  /manufacturers/{id}:
    get:
      tags:
        - Manufacturers
      parameters:
        - name: id
          in: path
          required: true
          description: The id of the manufacturer to retrieve
          type: string
      responses:
        200:
          description: Return the manufacturer with the specified id
        404:
          description: Manufacturer not found
  /retailers:
    get:
      tags:
        - Retailers
      description: Fetch all retailers
      responses:
        200:
          description: Returns all retailers
    post:
      tags:
        - Retailers
      description: Create a new retailer
      parameters:
        - name: retailer
          in: body
          description: a retailer
          required: true
          schema:
            $ref: "#/definitions/RetailerBody"
      responses:
        201:
          description: Successful insertion of retailers

  /retailers/{id}:
    get:
      tags:
        - Retailers
      parameters:
        - name: id
          in: path
          required: true
          description: The id of the retailer to retrieve
          type: string
      responses:
        200:
          description: Return the retailer with the specified id
        404:
          description: Retailer not found
  /suppliers:
    get:
      tags:
        - Suppliers
      description: Fetch all suppliers
      responses:
        200:
          description: Returns all suppliers
    post:
      tags:
        - Suppliers
      description: Create a new supplier
      parameters:
        - name: supplier
          in: body
          description: a supplier
          required: true
          schema:
            $ref: "#/definitions/SupplierBody"
      responses:
        201:
          description: Successful insertion of suppliers

  /suppliers/{id}:
    get:
      tags:
        - Suppliers
      parameters:
        - name: id
          in: path
          required: true
          description: The id of the supplier to retrieve
          type: string
      responses:
        200:
          description: Return the supplier with the specified id
        404:
          description: Supplier not found

  /fetchRawMaterial:
    post:
      tags:
        - fetchRawMaterial
      description: fetchRawMaterial
      parameters:
        - name: fetchRawMaterialParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/fetchRawMaterialBody"
      responses:
        201:
          description: fetchRawMaterial executed correctly
        500:
          description: fetchRawMaterial raised an exception

  /getRawMaterialFromSupplier:
    post:
      tags:
        - getRawMaterialFromSupplier
      description: getRawMaterialFromSupplier
      parameters:
        - name: getRawMaterialFromSupplierParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/getRawMaterialFromSupplierBody"
      responses:
        201:
          description: getRawMaterialFromSupplier executed correctly
        500:
          description: getRawMaterialFromSupplier raised an exception

  /createProducts:
    post:
      tags:
        - createProducts
      description: createProducts
      parameters:
        - name: createProductsParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/createProductsBody"
      responses:
        201:
          description: createProducts executed correctly
        500:
          description: createProducts raised an exception

  /sendProductsToDistribution:
    post:
      tags:
        - sendProductsToDistribution
      description: sendProductsToDistribution
      parameters:
        - name: sendProductsToDistributionParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/sendProductsToDistributionBody"
      responses:
        201:
          description: sendProductsToDistribution executed correctly
        500:
          description: sendProductsToDistribution raised an exception

  /orderProductsFromDistributor:
    post:
      tags:
        - orderProductsFromDistributor
      description: orderProductsFromDistributor
      parameters:
        - name: orderProductsFromDistributorParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/orderProductsFromDistributorBody"
      responses:
        201:
          description: orderProductsFromDistributor executed correctly
        500:
          description: orderProductsFromDistributor raised an exception

  /receiveProductsFromDistributor:
    post:
      tags:
        - receiveProductsFromDistributor
      description: receiveProductsFromDistributor
      parameters:
        - name: receiveProductsFromDistributorParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/receiveProductsFromDistributorBody"
      responses:
        201:
          description: receiveProductsFromDistributor executed correctly
        500:
          description: receiveProductsFromDistributor raised an exception

  /buyProductsFromRetailer:
    post:
      tags:
        - buyProductsFromRetailer
      description: buyProductsFromRetailer
      parameters:
        - name: buyProductsFromRetailerParams
          in: body
          required: true
          schema:
            $ref: "#/definitions/buyProductsFromRetailerBody"
      responses:
        201:
          description: buyProductsFromRetailer executed correctly
        500:
          description: buyProductsFromRetailer raised an exception
```

Once all these files are generated the next step is to compile the just created app with the command:

```
npx lerna run compile --scope < chaincode name >-app
```

In our supplychain scenario is:

```
npx lerna run compile --scope supplychainchaincode-app
```

The output should look something like:

```
in compileApiApplication in command.ts chaincode=supplychainchaincode
lerna notice cli v3.13.0
lerna info filter [ 'supplychainchaincode-app' ]
lerna info Executing command in 1 package: "npm run compile"
lerna info run Ran npm script 'compile' in 'supplychainchaincode-app' in 3.8s:

> supplychainchaincode-app@1.0.0 compile /Users/luca/Projects/GitHubProjects/convector-example-supplychain-master/packages/supplychainchaincode-app
> ts-node build.ts && tsc

lerna success run Ran npm script 'compile' in 1 package in 3.8s:
lerna success - supplychainchaincode-app
```

Then we can finally start the application with
```
npx lerna run start --scope < chaincode name >-app --stream
```

In our supplychain scenario is:

```
npx lerna run start --scope supplychainchaincode-app --stream
```

The output should look something like:

```
in startApiApplication in command.ts chaincode=supplychainchaincode
lerna notice cli v3.13.0
lerna info filter [ 'supplychainchaincode-app' ]
lerna info Executing command in 1 package: "npm run dev"
supplychainchaincode-app: > supplychainchaincode-app@1.0.0 dev /Users/luca/Projects/GitHubProjects/convector-example-supplychain-master/packages/supplychainchaincode-app
supplychainchaincode-app: > nodemon server/index.ts | pino-pretty
supplychainchaincode-app: [nodemon] 1.18.10
supplychainchaincode-app: [nodemon] to restart at any time, enter `rs`
supplychainchaincode-app: [nodemon] watching: /Users/luca/Projects/GitHubProjects/convector-example-supplychain-master/packages/supplychainchaincode-app/server/**/*
supplychainchaincode-app: [nodemon] starting `ts-node server/index.ts`
supplychainchaincode-app: (node:1541) DeprecationWarning: grpc.load: Use the @grpc/proto-loader module with grpc.loadPackageDefinition instead
supplychainchaincode-app: (node:1541) DeprecationWarning: grpc.load: Use the @grpc/proto-loader module with grpc.loadPackageDefinition instead
supplychainchaincode-app: (node:1541) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added. Use emitter.setMaxListeners() to increase limit
supplychainchaincode-app: [1550919167863] INFO  (supplychainchaincode-app/1541 on lucas-MacBook-Pro.local): up and running in development @: lucas-MacBook-Pro.local on port: 3000}
```

That means that the server is up and running listening on the port 3000.

you can reach it with the browser on http://localhost:3000 and you will find a simple webapp that with swagger gives you a simple web interface to invoke the API.

You can also test them with **curl**

+ creating a Distributor:
```
curl -X POST "http://localhost:3000/api/v1/supplychain/distributors" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"id\": \"DST3\", \"name\": \"Distributor3\", \"productsToBeShipped\": 123, \"productsShipped\": 123, \"productsReceived\": 123}"
```
+ getting all Manufacturers:
```
curl -X GET "http://localhost:3000/api/v1/supplychain/manufacturers" -H "accept: application/json"
```
+ getting a specific Retailer:
```
curl -X GET "http://localhost:3000/api/v1/supplychain/retailers/RTL_2" -H "accept: application/json"
```

+ fetching new material:
```
curl -X POST "http://localhost:3000/api/v1/supplychain/fetchRawMaterial" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"supplierId\": \"SPL_1\", \"rawMaterialSupply\": 12345555}"
```

## Multicontroller Chaincodes
Multicontroller chaincodes are now supported. You can take as example the https://github.com/worldsibu/convector-identity-patterns applying the decorators to the 2 controllers (in participant-cc and in product-cc) and adding the api.json file.

Then running the command
```
 conv-rest-api generate api -c identities -p identitiesproject
```

It will generate the APIs according to how you decorated the methods but in general it will create separate endpoints for the 2 controllers. For example:

```
http://localhost:3000/api/v1/identitiesproject/participant/register
```

In case of multicontroller projects the URL is composed by:
+ root endpoint: http://localhost:3000/api/v1/
+ project name : identitiesproject
+ controller name: participant
+ method name: register

Can be invoked like this:

```
curl -X POST "http://localhost:3000/api/v1/identitiesproject/participant/register" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"id\": \"luca\"}"
```

Another example:

```
curl -X POST "http://localhost:3000/api/v1/identitiesproject/product/create" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"id\": \"pro_1\", \"name\": \"mela\", \"ownerID\": \"luca\"}"
```
**Important**: The tool relies its work on the presence, in the root folder of your project, of a file called:
```
org1.<chaincode name>.config.json
```

That contains the list of controllers of the chaincode. If you want the tool to read from another file you can specify it with the **-f** parameter described already.

## Actual Known Limitations:

+ Generating code for infinite Hierarchies of Models (now only supports one ancestor)
+ Handling complex return types from Controller functions (like arrays of custom objects)
