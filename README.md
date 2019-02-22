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
+ It copies 
