import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { ClassDeclaration, MethodDeclaration, PropertyDeclaration } from 'ts-simple-ast';

import { ReflectionUtils } from '../utils/reflectionUtils';

/** Model compiler object. */
export class SmartApiSwaggerYamlModels extends SmartModel {

  /**
   *
   * @param name File name
   * @param chaincodeName Chaincode Name
   * @param projectName Chaincode project name
   * @param ignoreConvention Save right here
   */

  private dto;

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
    // let dto = JSON.stringify(this.getDTO(), null, 4);
    this.dto = await this.getDTO();
    await SysWrapper.createFileFromTemplate(
      this.filePath,
      {
        dto: this.dto
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
    return join(__dirname, '../../templates/_smartApiSwagger.yaml.ejs');
  }

  /** Actual file Path for the object. */
  get filePath() {
    return `packages/server/src/common/swagger/Api.yaml`;
  }

  private async getMethods(controllerPath: string) {
    let controllersPattern = join(process.cwd(), `.`) +
      controllerPath.substring(controllerPath.indexOf('file:') + 6) + `/src/**/*controller*.ts`;
    let controllerNames = await ReflectionUtils.getClassNames(controllersPattern);
    let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerNames[0]);
    return methods;
  }

  private async getModelClasses(controllerPath: string) {
    let modelsPattern = join(process.cwd(), `.`) + controllerPath.substring(controllerPath.indexOf('file:') + 6)
      + `/src/**/*model*.ts`;
    let modelClasses = await ReflectionUtils.getClasses(modelsPattern);
    return modelClasses;
  }

  private async getModelPropertiesDescription(controllerPath: string, className: string) {
    let modelsPattern = join(process.cwd(), `.`) + controllerPath.substring(controllerPath.indexOf('file:') + 6) +
      `/src/**/*model*.ts`;
    let classObj: { [k: string]: any } = {};
    classObj.className = className;
    classObj.classNameLowered = classObj.className.charAt(0).toLowerCase() + classObj.className.slice(1);
    let modelObj = await ReflectionUtils.getClassParametersDescriptionFull(modelsPattern, className, classObj);
    return modelObj;
  }

  private static getPropertyExampleExactPath(exactPath: string, className: string) {
    // d('className prima='+className);
    if (className.lastIndexOf('/') >= 0) {
      className = className.substring(className.lastIndexOf('/') + 1, className.lastIndexOf('.model'));
    }
    //d('className='+className);

    let classObj: { [k: string]: any } = {};
    classObj.className = className;
    classObj.classNameLowered = classObj.className.charAt(0).toLowerCase() + classObj.className.slice(1);
    let propertyExample = ReflectionUtils.getPropertyExample(className, exactPath);

    return propertyExample;
  }

  private static getPropertyExample(controllerPath: string, className: string) {
    // d('className prima='+className);
    let modelsPattern = '';
    modelsPattern = join(process.cwd(), `.`) + controllerPath.substring(controllerPath.indexOf('file:') + 6) +
      `/src/**/*.ts`;

    if (className.lastIndexOf('/') >= 0) {
      className = className.substring(className.lastIndexOf('/') + 1, className.lastIndexOf('.model'));
    }
    //d('className='+className);

    let classObj: { [k: string]: any } = {};
    classObj.className = className;
    classObj.classNameLowered = classObj.className.charAt(0).toLowerCase() + classObj.className.slice(1);
    let propertyExample = ReflectionUtils.getPropertyExample(className, modelsPattern);

    return propertyExample;
  }

  private async getDTO() {
    let dto: { [k: string]: any }[] = [];
    for (let innerController of this.controllers) {
      let innerDto: { [k: string]: any } = {};
      innerDto.projectName = this.projectName;
      innerDto.models = [];
      innerDto.serviceMethods = [];
      innerDto.createMethods = [];
      innerDto.getByIdMethods = [];
      innerDto.getAllMethods = [];
      innerDto.name = innerController.name.substring(0, innerController.name.lastIndexOf('-cc'));

      let modelClasses = await this.getModelClasses(innerController.version);

      for (let modelClass of modelClasses) {
        let modelObj = await this.getModelPropertiesDescription(innerController.version, modelClass.getName());
        innerDto.models.push(modelObj);
      }

      //d(innerDto.models);

      let controllerMethods = await this.getMethods(innerController.version);

      for (let method of controllerMethods) {

        if (method.getDecorator('GetAll')) {
          let getAllObj: { [k: string]: any } = {};
          getAllObj.methodParameterType = method.getDecorator('GetAll').getArguments()[0].getText()
            .replace(/[ '|\' ]/g, '');
          getAllObj.methodParameterTypeLowered = method.getDecorator('GetAll').getArguments()[0]
            .getText().replace(/[ '|\' ]/g, '').toLowerCase();
          innerDto.getAllMethods.push(getAllObj);
        } else if (method.getDecorator('GetById')) {
          let getByIdObj: { [k: string]: any } = {};
          getByIdObj.methodParameterType = method.getDecorator('GetById').getArguments()[0]
            .getText().replace(/[ '|\' ]/g, '');
          getByIdObj.methodParameterTypeLowered = method.getDecorator('GetById').getArguments()[0]
            .getText().replace(/[ '|\' ]/g, '').toLowerCase();
          innerDto.getByIdMethods.push(getByIdObj);
        } else if (method.getDecorator('Create')) {
          // d('è un creator');
          let createObj: { [k: string]: any } = {};
          createObj.methodName = method.getName();
          createObj.methodParameterType = method.getDecorator('Create').getArguments()[0]
            .getText().replace(/[ '|\' ]/g, '');
          createObj.methodParameterTypeLowered = method.getDecorator('Create').getArguments()[0]
            .getText().replace(/[ '|\' ]/g, '').toLowerCase();
          innerDto.createMethods.push(createObj);
        } else if (method.getDecorator('Service')) {
          let serviceMethodParameters: { [k: string]: any }[] = [];
          let serviceObj: { [k: string]: any } = {};
          serviceObj.methodName = method.getName();
          serviceObj.methodWithParameters = false;
          serviceObj.methodEndPoint = serviceObj.methodName;
          let parametersForEndpoint = '';
          let first = true;
          method.getParameters().forEach(async function (parameter) {
            //serviceObj.methodWithParameters = true;
            let param: { [k: string]: any } = {};
            param.name = parameter.getName();
            // d('param.name==' + param.name);
            if (parameter.getType().getArrayType() != undefined) {
              let arrayType = parameter.getType().getArrayType().getText();
              let parameterType = parameter.getType().getText();
              param.type = 'array';
              param.itemType = arrayType.substring(arrayType.lastIndexOf('.') + 1);

              if (arrayType.indexOf('\'') >= 0) {
                param.importPath = arrayType.substring(arrayType.indexOf('\'') + 1,
                  arrayType.lastIndexOf('\'')) + '.ts';
              } else {
                param.importPath = undefined;
              }

              if (param.importPath == undefined) {
                param.example = SmartApiSwaggerYamlModels
                  .getPropertyExample(innerController.version, param.itemType + '[');
              } else {
                param.example = SmartApiSwaggerYamlModels
                  .getPropertyExampleExactPath(param.importPath, param.itemType + '[');
              }
            } else {
              let parameterType = parameter.getType().getText();
              param.type = parameterType.substring(parameterType.lastIndexOf('.') + 1);
              param.example = SmartApiSwaggerYamlModels.getPropertyExample(innerController.version, param.type);
            }

            serviceMethodParameters.push(param);

            if (first) {
              parametersForEndpoint = '/' + '{' + parameter.getName() + '}';
              first = false;
            } else {
              parametersForEndpoint = parametersForEndpoint.concat('/{').concat(parameter.getName()) + '}';
            }
          });
          serviceObj.methodParameters = serviceMethodParameters;
          innerDto.serviceMethods.push(serviceObj);
        } else {
          continue;
        }
      }
      dto.push(innerDto);
    }
    //d(dto[1].models[0].classProperties);
    return dto;
  }

}
