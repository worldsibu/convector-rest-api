# convector-rest-api

This project aims to provide an easy way for generating automatically client API for Convector projects.

For showing and explaining how it works we'll start from the SupplyChain example that you can find here: https://github.com/xcottos/convector-example-supplychain-master and we'll generate automatically the client API.

First clone the SupplyChain project:

```
git clone https://github.com/xcottos/convector-example-supplychain-master
```

I am not explaining again here how the project works and its internals (you can find it in the project docs)

The first step is adding as a **dependency** the package **convector-rest-api** in the **package.json** in the **convector-example-supplychain-master/packages/supplychainchaincode-cc** folder that contains the code of our chaincode.

So the **package.json** will be:

```javascript
{
  "name": "supplychainchaincode-cc",
  "version": "0.1.0",
  "description": "Chaincodes package for supplychainchaincode",
  "main": "./dist/src/index.js",
  "typings": "./dist/src/index.d.ts",
  "files": [
    "dist/*"
  ],
  "scripts": {
    "clean": "rimraf dist client",
    "build": "npm run clean && npm run client:generate && tsc",
    "prepare": "npm run build",
    "test": "npm run build && mocha -r ts-node/register tests/*.spec.ts --reporter spec",
    "client:generate": "generate-controller-interface -c SupplychainchaincodeController"
  },
  "devDependencies": {
    "@types/chai": "^4.1.4",
    "@types/mocha": "^5.2.5",
    "@types/node": "^10.12.5",
    "chai": "^4.1.2",
    "mocha": "^5.0.3",
    "rimraf": "^2.6.2"
  },
  "dependencies": {
    "convector-rest-api": "^1.0.9"
  }
}
```

Now in the root of the project (**convector-example-supplychain-master**) you can run the command:

```
npm i
```
that will install all the dependencies (included the new one just introduced in the package.json) that we'll use in the next steps)

Now that the dependencies are installed we can pass to the configuration of the api generator that can be logically divided in:

+ Infrastructure configuration
+ API configuration

For the **infrastructure configuration** you need to create a file in the root of the project (**convector-example-supplychain-master**) called **api.json** that contains the infrastructure parameters.

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
+ **COUCHDBVIEW**:
+ **COUCHDB_PORT**: the port where couhdb is in listening
+ **COUCHDB_HOST**: the host where couchdb is installed
+ **COUCHDB_PROTOCOL**: the protocol used by couchdb

The **API configuration** instead is achieved **annotating** the methods in the chaincode controller (usually located in **packages/< chaincode name >-cc/src folder**) with the following possibilities:

+ **@Create(< model class >)**: It tells the generator to consider this method as a **post** method for generating instances of the model which class is **<model class>**. For example in the controller file **packages/supplychainchaincode-cc/src/supplychainchaincode.controller.ts**:

```javascript
@Create('Supplier')
@Invokable()
public async createSupplier(
  @Param(Supplier)
  supplier: Supplier
) {

  console.log('prima await')
  await supplier.save();
  console.log('dopo await')

  const storedSuppliers = await Supplier.getAll('io.worldsibu.Supplier');
  console.log(storedSuppliers);
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
  console.log(supplier);
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
  console.log(storedSuppliers);
  return storedSuppliers;
}
```

+ **@Service()** It tells the generator to consider this method as a **get** method that doesn't return any  result and can have any number and type of parameters. It will generate an API wrapper accordingly (it will be better explained once described the **router.ts** generated file).
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

import { GetById, GetAll, Create, Service } from 'convector-rest-api';

@Controller('supplychainchaincode')
export class SupplychainchaincodeController extends ConvectorController {

  @Create('Supplier')
  @Invokable()
  public async createSupplier(
    @Param(Supplier)
    supplier: Supplier
  ) {

    console.log('prima await')
    await supplier.save();
    console.log('dopo await')

    const storedSuppliers = await Supplier.getAll('io.worldsibu.Supplier');
    console.log(storedSuppliers);
  }

  @Create('Manufacturer')
  @Invokable()
  public async createManufacturer(
    @Param(Manufacturer)
    manufacturer: Manufacturer
  ) {

    console.log('prima await')
    await manufacturer.save();
    console.log('dopo await')

    const storedManufacturers = await Manufacturer.getAll('io.worldsibu.Manufacturer');
    console.log(storedManufacturers);
  }

  @Create('Distributor')
  @Invokable()
  public async createDistributor(
    @Param(Distributor)
    distributor: Distributor
  ) {

    console.log('prima await')
    await distributor.save();
    console.log('dopo await')

    const storedDistributors = await Distributor.getAll('io.worldsibu.Distributor');
    console.log(storedDistributors);
  }

  @Create('Retailer')
  @Invokable()
  public async createRetailer(
    @Param(Retailer)
    retailer: Retailer
  ) {

    console.log('prima await')
    await retailer.save();
    console.log('dopo await')

    const storedRetailers = await Retailer.getAll('io.worldsibu.Retailer');
    console.log(storedRetailers);
  }

  @Create('Customer')
  @Invokable()
  public async createCustomer(
    @Param(Customer)
    customer: Customer
  ) {
    await customer.save();
    const storedCustomers = await Customer.getAll('io.worldsibu.Customer');
    console.log(storedCustomers);
  }

  @GetAll('Supplier')
  @Invokable()
  public async getAllSuppliers()
  {
    const storedSuppliers = await Supplier.getAll('io.worldsibu.Supplier');
    console.log(storedSuppliers);
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
    console.log(supplier);
    return supplier;
  }

  @GetAll('Manufacturer')
  @Invokable()
  public async getAllManufacturers()
  {
    const storedManufacturers = await Manufacturer.getAll('io.worldsibu.Manufacturer');
    console.log(storedManufacturers);
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
    console.log(manufacturer);
    return manufacturer;
  }

  @GetAll('Distributor')
  @Invokable()
  public async getAllDistributors()
  {
    const storedDistributors = await Distributor.getAll('io.worldsibu.Distributor');
    console.log(storedDistributors);
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
    console.log(distributor);
    return distributor;
  }

  @GetAll('Retailer')
  @Invokable()
  public async getAllRetailers()
  {
    const storedRetailers = await Retailer.getAll('io.worldsibu.Retailer');
    console.log(storedRetailers);
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
    console.log(retailer);
    return retailer;
  }

  @GetAll('Customer')
  @Invokable()
  public async getAllCustomers()
  {
    const storedCustomers = await Customer.getAll('io.worldsibu.Customer');
    console.log(storedCustomers);
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
    console.log(customer);
    return customer;
  }

  @Invokable()
  public async getAllModels()
  {
    const storedCustomers = await Customer.getAll('io.worldsibu.Customer');
    console.log(storedCustomers);

    const storedRetailers = await Retailer.getAll('io.worldsibu.Retailer');
    console.log(storedRetailers);

    const storedDistributors = await Distributor.getAll('io.worldsibu.Distributor');
    console.log(storedDistributors);

    const storedManufacturers = await Manufacturer.getAll('io.worldsibu.Manufacturer');
    console.log(storedManufacturers);

    const storedSuppliers = await Supplier.getAll('io.worldsibu.Supplier');
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

Once defined the infrastructure and once annotated the controller methods, we need to install the yeoman (https://yeoman.io) generator that will be used for creating the skeleton of our backend:

```
npm install -g generator-express-no-stress-typescript
```

Then we can install the **convector-rest-api** npm package (you can install it also directly from this project if you have in mind to develop and to change it)

```
npm install -g convector-rest-api
```

This will install in your PATH an executable called **conv-rest-api**.

Now to generate the API application you just need to go in the root of your project and run:

```
conv-rest-api generate api -c <chaincode name> -p <project name>
```

While the chaincode name parameter will tell the generator where to look for the methods to be wrapped by APIs, the project name will be used only for defining the name of the project swagger and to give to the Router class a proper name.

For our supply chain example we can run in the folder **convector-example-supplychain-master**:

```
conv-rest-api generate api -c supplychainchaincode -p supplychain
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
    const contextPath = join(__dirname, process.env.KEYSTORE + '/' + process.env.USERCERT);

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
import { SelfGenContext } from "./selfgenfabriccontext";
import { SupplychainchaincodeControllerClient } from "supplychainchaincode-cc/client";
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';

export namespace SupplychainchaincodeController  {
    export async function init(): Promise<SupplychainchaincodeControllerClient> {
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
        return new SupplychainchaincodeControllerClient(adapter);
    }
}
```
What we did here is defining an object called SupplyChainController that has a function init() that reads the USERCERT variable from the .env file, and creates the client that we defined above. Then it creates a FabricControllerAdapter reading the CHANNEL, the CHAINCODE and other parameters read from .env. Once configured the adapter ini initiated with the init() invocation.

+ It generates the file **packages/< chaincode name >-app/server/smartContractModels.ts** hat will export the names of the Models using the ones defined in the client directory. This class will be used in the controller client that will be described shortly:

In out supplychain scenario the generated file will be:
```javascript
import { BaseStorage } from '@worldsibu/convector-core-storage';
import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';

import { Customer as CustomerModel } from 'supplychainchaincode-cc/client';
import { Distributor as DistributorModel } from 'supplychainchaincode-cc/client';
import { Manufacturer as ManufacturerModel } from 'supplychainchaincode-cc/client';
import { Retailer as RetailerModel } from 'supplychainchaincode-cc/client';
import { Supplier as SupplierModel } from 'supplychainchaincode-cc/client';

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
import { SupplychainchaincodeController } from '../../../smartContractControllers';
import { Models } from '../../../smartContractModels';

export class Controller {

  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getAllSuppliers();
    res.json(result);
  }

  async getAllManufacturers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getAllManufacturers();
    res.json(result);
  }

  async getAllDistributors(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getAllDistributors();
    res.json(result);
  }

  async getAllRetailers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getAllRetailers();
    res.json(result);
  }

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getAllCustomers();
    res.json(result);
  }


  async getSupplierById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getSupplierById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async getManufacturerById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getManufacturerById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async getDistributorById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getDistributorById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async getRetailerById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getRetailerById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async getCustomerById(req: Request, res: Response) {
    let cntrl = await SupplychainchaincodeController.init();
    let result = await cntrl.getCustomerById(req.params.id);
    if (!result) {
      return res.status(404);
    }
    res.json(result);
  }

  async createSupplier(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeController.init();
      let modelRaw = req.body;
      let model = new Models.Supplier(modelRaw);
      await cntrl.createSupplier(model);
      res.send(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async createManufacturer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeController.init();
      let modelRaw = req.body;
      let model = new Models.Manufacturer(modelRaw);
      await cntrl.createManufacturer(model);
      res.send(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async createDistributor(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeController.init();
      let modelRaw = req.body;
      let model = new Models.Distributor(modelRaw);
      await cntrl.createDistributor(model);
      res.send(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async createRetailer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeController.init();
      let modelRaw = req.body;
      let model = new Models.Retailer(modelRaw);
      await cntrl.createRetailer(model);
      res.send(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      let cntrl = await SupplychainchaincodeController.init();
      let modelRaw = req.body;
      let model = new Models.Customer(modelRaw);
      await cntrl.createCustomer(model);
      res.send(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex);
    }
  }

async fetchRawMaterial(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.fetchRawMaterial(req.params.supplierId,req.params.rawMaterialSupply);
    res.send(201);
  } catch (ex) {
    console.log(ex.message, ex.stack);
    res.status(500).send(ex);
  }
}

async getRawMaterialFromSupplier(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.getRawMaterialFromSupplier(req.params.manufacturerId,req.params.supplierId,req.params.rawMaterialSupply);
    res.send(201);
  } catch (ex) {
    console.log(ex.message, ex.stack);
    res.status(500).send(ex);
  }
}

async createProducts(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.createProducts(req.params.manufacturerId,req.params.rawMaterialConsumed,req.params.productsCreated);
    res.send(201);
  } catch (ex) {
    console.log(ex.message, ex.stack);
    res.status(500).send(ex);
  }
}

async sendProductsToDistribution(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.sendProductsToDistribution(req.params.manufacturerId,req.params.distributorId,req.params.sentProducts);
    res.send(201);
  } catch (ex) {
    console.log(ex.message, ex.stack);
    res.status(500).send(ex);
  }
}

async orderProductsFromDistributor(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.orderProductsFromDistributor(req.params.retailerId,req.params.distributorId,req.params.orderedProducts);
    res.send(201);
  } catch (ex) {
    console.log(ex.message, ex.stack);
    res.status(500).send(ex);
  }
}

async receiveProductsFromDistributor(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.receiveProductsFromDistributor(req.params.retailerId,req.params.distributorId,req.params.receivedProducts);
    res.send(201);
  } catch (ex) {
    console.log(ex.message, ex.stack);
    res.status(500).send(ex);
  }
}

async buyProductsFromRetailer(req: Request, res: Response) {
  try {
    let cntrl = await SupplychainchaincodeController.init();
    await cntrl.buyProductsFromRetailer(req.params.retailerId,req.params.customerId,req.params.boughtProducts);
    res.send(201);
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
+ **@Service** methods: will be mapped to GET methods where as convention the endpoint will be the name of the methods and all the parameters will be passed separating them with a '/'; For example  ```.get('/fetchRawMaterial/:supplierId/:rawMaterialSupply', controller.fetchRawMaterial)```

In the supplychain example the complete file will be:

```javascript
import express from 'express';
import controller from './controller'
export default express.Router()

    .post('/suppliers/', controller.createSupplier)
    .post('/manufacturers/', controller.createManufacturer)
    .post('/distributors/', controller.createDistributor)
    .post('/retailers/', controller.createRetailer)
    .post('/customers/', controller.createCustomer)
    .get('/suppliers/', controller.getAllSuppliers)
    .get('/manufacturers/', controller.getAllManufacturers)
    .get('/distributors/', controller.getAllDistributors)
    .get('/retailers/', controller.getAllRetailers)
    .get('/customers/', controller.getAllCustomers)
    .get('/suppliers/:id', controller.getSupplierById)
    .get('/manufacturers/:id', controller.getManufacturerById)
    .get('/distributors/:id', controller.getDistributorById)
    .get('/retailers/:id', controller.getRetailerById)
    .get('/customers/:id', controller.getCustomerById)
    .get('/fetchRawMaterial/:supplierId/:rawMaterialSupply', controller.fetchRawMaterial)
    .get('/getRawMaterialFromSupplier/:manufacturerId/:supplierId/:rawMaterialSupply', controller.getRawMaterialFromSupplier)
    .get('/createProducts/:manufacturerId/:rawMaterialConsumed/:productsCreated', controller.createProducts)
    .get('/sendProductsToDistribution/:manufacturerId/:distributorId/:sentProducts', controller.sendProductsToDistribution)
    .get('/orderProductsFromDistributor/:retailerId/:distributorId/:orderedProducts', controller.orderProductsFromDistributor)
    .get('/receiveProductsFromDistributor/:retailerId/:distributorId/:receivedProducts', controller.receiveProductsFromDistributor)
    .get('/buyProductsFromRetailer/:retailerId/:customerId/:boughtProducts', controller.buyProductsFromRetailer)

;
```

TO BE COMPLETED
