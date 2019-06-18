import { ReflectionUtils } from './utils/reflectionUtils';
import { join } from 'path';
import { SysWrapper } from './utils/sysWrapper';
import {
  EnvModel, SmartContractControllers,
  SmartContractModels, SmartApiController, SmartRoutesModels,
  SmartRouterModels, SmartApiSwaggerYamlModels
} from './models';

//const { spawn } = require('child_process');

import * as child from 'child_process';
import { d } from './utils/debug';
import { TsConfigJsonGenerator } from './generators/tsconfig.json';
import { PackageJsonGenerator } from './generators/package.json';
import { Pm2ConfigJsonGenerator } from './generators/pm2config.json';
import { AppTsGenerator } from './generators/app.ts';
import { EnvTsGenerator } from './generators/env.ts';
import { ConvectorTsGenerator } from './generators/convector.ts';
import { ControllerTsGenerator } from './generators/controller.ts';
import { RouterTsOptions, RouterTsGenerator } from './generators/router.ts';
import { ApiConfigurationList, ApiConfigurationItem } from './models/apiConfigurationFile';
import { SwaggerJsonGenerator } from './generators/swagger.json';

/** Model compiler object. */
export class ApiGenerator {

  get controllers(): { [k: string]: any }[] {
    let chaincodeConfig: { [k: string]: any };
    if (this.chaincodeConfigFile[0] != '/') {
      chaincodeConfig = require(join(process.cwd(), `/`) + this.chaincodeConfigFile);
    } else {
      chaincodeConfig = require(this.chaincodeConfigFile);
    }
    //d(chaincodeConfig);
    let controllers: { [k: string]: any }[];
    controllers = chaincodeConfig.controllers;
    return controllers;
  }

  root = 'packages/server';

  constructor(
    public name: string,
    public chaincode: string,
    public chaincodeConfigFile: string) { }

  public async generate() {
    let chaincodePackages = '( ';
    let first = true;
    for (let controller of this.controllers) {
      if (!first) {
        chaincodePackages += ' ';
      } else {
        first = false;
      }
      chaincodePackages += controller.name;
    }
    chaincodePackages += ' )';

    let apiGen = child.spawn('bash',
      [join(__dirname, '../templates_scripts/generate_api_template.bash'),
      this.chaincode, chaincodePackages], {
        stdio: [process.stdin, process.stdout, process.stderr]
      });
    apiGen.on('close', async (code) => {
      // let ctrl = new EnvModel(this.name, this.chaincode, null, false);
      // await ctrl.save();
      d('generating tsConfig...');

      const tsConfig = new TsConfigJsonGenerator('tsconfig.json',
        this.root);
      await tsConfig.save();
      const app = new AppTsGenerator('app.ts',
        `${this.root}/src`);
      await app.save();
      const packageJson = new PackageJsonGenerator('package.json',
        this.root, { controllers: this.controllers });
      await packageJson.save();
      const pm2ConfigJson = new Pm2ConfigJsonGenerator('pm2.config.json',
        this.root);
      await pm2ConfigJson.save();
      const envTs = new EnvTsGenerator('env.ts',
        `${this.root}/src`, { chaincodeName: this.chaincode });
      await envTs.save();
      const convectorTs = new ConvectorTsGenerator('convector.ts',
        `${this.root}/src`, { controllers: this.controllers });
      await convectorTs.save();

      // d('generating SmartContractModels..');
      // await this.generateSmartContractModels();
      // d('generating Controller..');

      let apiOptions = JSON.parse(await SysWrapper.getFile('api.json')).map(item => {
        return new ApiConfigurationItem(item);
      });

      apiOptions = await this.enrichApiOptionsWithParams(apiOptions);

      const controllersTs = new ControllerTsGenerator('controllers.ts',
        `${this.root}/src/controllers`, { controllers: this.controllers, config: apiOptions });
      await controllersTs.save();
      const routerTs = new RouterTsGenerator('router.ts',
        `${this.root}/src/controllers`, { config: apiOptions });
      await routerTs.save();

      // const swaggerTs = new SwaggerJsonGenerator('swagger.json',
      //   `${this.root}/src/common/open-api/`, { config: apiOptions });
      // await swaggerTs.save();

      // await this.generateController();
      // d('generating Routes..');
      // d('generating Router..');
      // await this.generateRouter();
      // d('generating SwaggerYaml..');

      d('finished');
    });
  }

  async enrichApiOptionsWithParams(config) {
    for (let item of config) {
      item.params = await this.getParams(item.controller, item.function);
    }
    return config;
  }
  private async getParams(controllerName: string, functionName: string) {
    const plainName = controllerName.replace('Controller', '').toLowerCase();

    let controllersPattern = join(process.cwd(), `.`) +
      `/packages/**-cc/src/${plainName}.controller.ts`;
    let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerName);

    let method = methods.find(item => item.getName() === functionName);
    let res = [];
    res = method.getParameters().map(item => {
      let type = '';
      // if (item.getType().getArrayType() != undefined) {

      // }

      return {
        name: item.getName(),
        type: type
      };
    });
    return res;
  }

  private async copyTsConfig() {
    await SysWrapper.copyFile(join(__dirname,
      '../templates/_tsconfig-api.json.ejs'), join(process.cwd(), `.`) +
      `/packages/server/tsconfig.json`);
  }

  private async copyAppTs() {
    await SysWrapper.copyFile(join(__dirname,
      '../templates/_app.ts.ejs'), join(process.cwd(), `.`) +
      `/packages/server/src/app.ts`);
  }
  private async copyPackageJson(chaincodes: string[]) {
    await SysWrapper.createFile(
      join(process.cwd(), `.`) +
      `/packages/server/package.json`, `{
        "name": "server",
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
          "start": "npm run build && pm2-runtime pm2.config.json",
          "start:daemon": "pm2 startOrRestart pm2.config.json --no-daemon",
          "stop": "pm2 stop pm2.config.json",
          "tsc": "tsc",
          "clean": "rimraf dist client",
          "refresh": "./node_modules/pm2/bin/pm2 stop 0 && ./node_modules/pm2/bin/pm2 start 0",
          "build": "npm run clean && tsc",
          "prepare": "npm run build",
          "test": "mocha -r ts-node/register test/*.spec.ts --reporter spec"
        },
        "author": "",
        "license": "ISC",
        "dependencies": {
          "@types/bytebuffer": "^5.0.40",
          "@types/node": "^12.0.8",
          "@worldsibu/convector-adapter-fabric": "^1.3.4",
          "@worldsibu/convector-storage-couchdb": "^1.3.4",
          "fabric-ca-client": "^1.4.1",
          "fabric-client": "^1.4.1"
        }
      }
      `);

  }
  private async copyPm2ConfigJson(chaincodes: string[]) {
    await SysWrapper.createFile(
      join(process.cwd(), `.`) +
      `/packages/server/pm2.config.json`, `{
        "apps": [
          {
            "name": "Convector Autogenerated Server",
            "script": "./dist/app.js",
            "node_args": "--inspect=0.0.0.0:8888",
            "error_file": "../log/error.log",
            "out_file": "../log/access.log",
            "env": {},
            "watch": [
              "src",
              "dist",
              "node_modules",
              ".env"
            ]
          }
        ]
      }`);
  }
}
