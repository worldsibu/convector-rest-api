import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { MethodDeclaration } from "ts-simple-ast";

import { ReflectionUtils } from '../utils/reflectionUtils';

/** Model compiler object. */
export class SmartRouterModels extends SmartModel {

  /**
   *
   * @param name File name
   * @param chaincodeName Chaincode Name
   * @param projectName Chaincode project name
   * @param ignoreConvention Save right here
   */
  constructor(
    public name: string,
    public chaincodeName: string,
    public projectName: string,
    public controllers: { [k: string]: any }[],
    public ignoreConvention?: boolean) {
    super(name, projectName);
  }

  recompile() {
    throw new Error('Method not implemented.');
  }

  async save() {
    let dto = await this.getDTO();
    await SysWrapper.createFileFromTemplate(
      this.filePath,
      {
        dto: dto

      }, this.templateFile);
  }

  /** TypeScript classs. */

  get chaincodeClientFolder() {
    return this.chaincodeName.match(/[a-z]+/gi)
      .map(function (word) {
        return word + '-cc/client';
      })
      .join('');
  }

  get applicationName() {
    return this.chaincodeName.match(/[a-z]+/gi)
      .map(function (word) {
        return word + '-app';
      })
      .join('');
  }
  /**
   * Static template file to be used.
   */
  get templateFile() {
    return join(__dirname, '../../templates/_smartRouter.ts.ejs');
  }

  /** Actual file Path for the object. */
  get filePath() {
    return `${this.projectRoot}/packages/server/src/controllers/router.ts`;
  }

  private async getMethods(controllerName: string) {
    let controllersPattern = join(process.cwd(), `.`) + `/packages/` + controllerName + `/src/**/*controller*.ts`;
    let controllerNames = await ReflectionUtils.getClassNames(controllersPattern);
    let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerNames[0]);
    return methods;
  }

  private async getDTO() {
    let dto: { [k: string]: any }[] = [];
    for (let innerController of this.controllers) {
      let innerDto: { [k: string]: any } = {};
      let getAllMethods = [];
      let getByIdMethods = [];
      let createMethods = [];
      let serviceMethods = [];

      let controllerMethods = await this.getMethods(innerController.name);
      for (let method of controllerMethods) {
        //d("method name: " + method.getName());
        if (method.getDecorator("GetAll")) {
          let getAllObj: { [k: string]: any } = {};
          getAllObj.methodName = method.getName();
          getAllObj.methodClassName = method.getDecorator("GetAll").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
          getAllObj.methodEndPoint = getAllObj.methodClassName.charAt(0).toLowerCase() + getAllObj.methodClassName.slice(1) + 's';
          getAllMethods.push(getAllObj);
        } else if (method.getDecorator("GetById")) {
          let getIdObj: { [k: string]: any } = {};
          getIdObj.methodName = method.getName();
          getIdObj.methodClassName = method.getDecorator("GetById").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
          getIdObj.methodEndPoint = getIdObj.methodClassName.charAt(0).toLowerCase() + getIdObj.methodClassName.slice(1) + 's';
          getByIdMethods.push(getIdObj);
        } else if (method.getDecorator("Create")) {
          //d("è un creator");
          let createObj: { [k: string]: any } = {};
          createObj.methodName = method.getName();
          createObj.methodClassName = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
          createObj.methodEndPoint = createObj.methodClassName.charAt(0).toLowerCase() + createObj.methodClassName.slice(1) + 's';
          createMethods.push(createObj);
        }
        else if (method.getDecorator("Service")) {
          let serviceObj: { [k: string]: any } = {};
          serviceObj.methodName = method.getName();
          serviceObj.methodEndPoint = serviceObj.methodName;
          serviceMethods.push(serviceObj);
        }
      }

      innerDto.controllerClassName = innerController.controller;
      innerDto.getAllMethods = getAllMethods;
      innerDto.getByIdMethods = getByIdMethods;
      innerDto.createMethods = createMethods;
      innerDto.serviceMethods = serviceMethods;
      innerDto.name = innerController.name.substring(0, innerController.name.lastIndexOf("-cc"));

      dto.push(innerDto);
    }
    return dto;
  }

}
