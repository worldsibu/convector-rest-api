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
    public chaincode: string) { }

  public async generate() {
    console.log('generating stub..');
    let apiGen = child.spawn('bash', [join(__dirname, '../templates_scripts/generate_api_template.bash'), this.chaincode], { stdio: [process.stdin, process.stdout, process.stderr] });
    apiGen.on('close', async (code) => {
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
      console.log('to run the application (it must be compiled first): lerna run dev --scope ' + this.chaincode + '-app --stream');
    });
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
    let smartContractControllers = new SmartContractControllers(this.name, this.chaincode, null, false);
    await smartContractControllers.save();
  }

  private async generateSmartContractModels() {
    let modelsPattern = join(process.cwd(), `.`) + `/packages/${this.chaincode}-cc/src/**/*model*.ts`;
    let modelNames = await ReflectionUtils.getClassNames(modelsPattern);
    let smartContractModels = new SmartContractModels(this.name, this.chaincode, null, modelNames, false);
    await smartContractModels.save();
  }

  private async generateController() {
    let controllersPattern = join(process.cwd(), `.`) + `/packages/${this.chaincode}-cc/src/**/*controller*.ts`;
    let controllerNames = await ReflectionUtils.getClassNames(controllersPattern);
    let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerNames[0]);
    let smartApiController = new SmartApiController(this.name,
      this.chaincode, null, methods, controllerNames[0], false);
    await smartApiController.save();
  }

  private async generateRoutes() {
    let smartRoutesModels = new SmartRoutesModels(this.name, this.chaincode, this.projectName, false);
    await smartRoutesModels.save();
  }

  private async generateRouter() {
    let controllersPattern = join(process.cwd(), `.`) + `/packages/${this.chaincode}-cc/src/**/*controller*.ts`;
    let controllerNames = await ReflectionUtils.getClassNames(controllersPattern);
    let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerNames[0]);
    let smartRouterModels = new SmartRouterModels(this.name, this.chaincode, null, methods, controllerNames[0], false);
    await smartRouterModels.save();
  }

  private async generateSwaggerYaml() {
    let modelsPattern = join(process.cwd(), `.`) + `/packages/${this.chaincode}-cc/src/**/*model*.ts`;
    let modelNames = await ReflectionUtils.getClassNames(modelsPattern);
    let modelClasses = await ReflectionUtils.getClasses(modelsPattern);
    let controllersPattern = join(process.cwd(), `.`) + `/packages/${this.chaincode}-cc/src/**/*controller*.ts`;
    let controllerNames = await ReflectionUtils.getClassNames(controllersPattern);
    let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerNames[0]);
    let smartApiSwaggerModels = new SmartApiSwaggerYamlModels(this.name,
      this.chaincode, this.projectName, modelNames, modelClasses, methods, false);
    await smartApiSwaggerModels.save();
  }
}
