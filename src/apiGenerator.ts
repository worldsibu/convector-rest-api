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

/** Model compiler object. */
export class ApiGenerator {

  /**
   * @param name name
   * @param projectName Project name
   * @param chaincode Chaincode Name
   */

  constructor(
    public name: string,
    public projectName: string,
    public chaincode: string,
    public chaincodeConfigFile:string) { }


  get controllers(){
    let chaincodeConfig: { [k: string]: any };
    if (this.chaincodeConfigFile[0] != '/') {
      chaincodeConfig = require(join(process.cwd(), `/`) + this.chaincodeConfigFile);
    }
    else {
      chaincodeConfig = require(this.chaincodeConfigFile);
    }
    //console.log(chaincodeConfig);
    let controllers: { [k: string]: any }[];
    controllers = chaincodeConfig.controllers;
    return controllers;
  }

  public async generate() {
    console.log('generating stub..');
    let chaincodePackages = '( ';
    let first = true;
    for (let controller of this.controllers) {
      if (!first) {
        chaincodePackages += ' ';
      }
      else {
        first = false;
      }
      chaincodePackages += controller.name;
    }
    chaincodePackages += ' )';

    // let apiGen = child.spawn('bash', [join(__dirname, '../templates_scripts/generate_api_template.bash'), this.chaincode, chaincodePackages], { stdio: [process.stdin, process.stdout, process.stderr] });
    // apiGen.on('close', async (code) => {
      let ctrl = new EnvModel(this.name, this.chaincode, null, false);
      await ctrl.save();
      console.log('generating tsConfig..');
      await this.copyTsConfig();
      console.log('generating selfgenfabriccontext..');
      await this.copySelfgenfabriccontext();
      console.log('generating SmartContractControllers..');
      await this.generateSmartContractControllers();
      console.log('generating SmartContractModels..');
      await this.generateSmartContractModels();
      console.log('generating Controller..');
      await this.generateController();
      console.log('generating Routes..');
      await this.generateRoutes();
      console.log('generating Router..');
      await this.generateRouter();
      console.log('generating SwaggerYaml..');
      await this.generateSwaggerYaml();
      console.log('finished');
      console.log('to compile the application: npx lerna run compile --scope ' + this.chaincode + '-app');
      console.log('to run the application (it must be compiled first): lerna run start --scope ' + this.chaincode + '-app --stream');
    // });
  }

  private async copyTsConfig() {
    await SysWrapper.copyFile(join(__dirname,
      '../templates/_tsconfig-api.json.ejs'), join(process.cwd(), `.`) +
      `/packages/${this.chaincode}-app/tsconfig.json`);
  }

  private async copySelfgenfabriccontext() {
    await SysWrapper.copyFile(join(__dirname,
      '../templates/_selfgenfabriccontext.ts.ejs'), join(process.cwd(), `.`) +
      `/packages/${this.chaincode}-app/server/selfgenfabriccontext.ts`);
  }

  private async generateSmartContractControllers() {
    let smartContractControllers = new SmartContractControllers(this.name, this.chaincode, null, this.controllers, false);
    await smartContractControllers.save();
  }

  private async generateSmartContractModels() {
    let smartContractModels = new SmartContractModels(this.name, this.chaincode, null, this.controllers, false);
    await smartContractModels.save();
  }

  private async generateController() {
    let smartApiController = new SmartApiController(this.name,this.chaincode, null, this.controllers, false);
    await smartApiController.save();
  }

  private async generateRoutes() {
    let smartRoutesModels = new SmartRoutesModels(this.name, this.chaincode, this.projectName, false);
    await smartRoutesModels.save();
  }

  private async generateRouter() {
    let smartRouterModels = new SmartRouterModels(this.name, this.chaincode, null, this.controllers, false);
    await smartRouterModels.save();
  }

  private async generateSwaggerYaml() {
    let smartApiSwaggerModels = new SmartApiSwaggerYamlModels(this.name, this.chaincode, this.projectName, this.controllers, false);
    await smartApiSwaggerModels.save();
  }
}
