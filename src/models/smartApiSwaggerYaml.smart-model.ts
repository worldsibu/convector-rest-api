import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { ClassDeclaration, MethodDeclaration, PropertyDeclaration } from "ts-simple-ast";

import { ReflectionUtils } from '../utils/reflectionUtils';

/** Model compiler object. */
export class SmartApiSwaggerYamlModels extends SmartModel
{

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
        return `packages/${this.applicationName}/server/common/swagger/Api.yaml`;
    }

    private async getMethods(controllerName:string) {
      let controllersPattern = join(process.cwd(), `.`) + `/packages/` + controllerName + `/src/**/*controller*.ts`;
      let controllerNames = await ReflectionUtils.getClassNames(controllersPattern);
      let methods = await ReflectionUtils.getClassMethods(controllersPattern, controllerNames[0]);
      return methods;
    }

    private async getModelNames(controllerName:string) {
      let modelsPattern = join(process.cwd(), `.`) + `/packages/` + controllerName + `/src/**/*model*.ts`;
      let modelNames = await ReflectionUtils.getClassNames(modelsPattern);
      return modelNames;
    }

    private async getModelClasses(controllerName:string) {
      let modelsPattern = join(process.cwd(), `.`) + `/packages/` + controllerName + `/src/**/*model*.ts`;
      let modelClasses = await ReflectionUtils.getClasses(modelsPattern);
      return modelClasses;
    }

    private async getModelPropertiesDescription(controllerName:string, className:string) {
      let modelsPattern = join(process.cwd(), `.`) + `/packages/` + controllerName + `/src/**/*model*.ts`;
      let classObj: { [k: string]: any } = {};
      classObj.className = className;
      classObj.classNameLowered = classObj.className.charAt(0).toLowerCase() + classObj.className.slice(1);
      let modelObj = await ReflectionUtils.getClassParametersDescriptionFull(modelsPattern, modelsPattern, className, controllerName, classObj);
      return modelObj;
    }
    
    private static getPropertyExample(controllerName:string, className:string) {
      // console.log("className prima="+className);
      if (className.lastIndexOf("/") >= 0) {
        className = className.substring(className.lastIndexOf("/")+1, className.lastIndexOf(".model"))
      }
      //console.log("className="+className);

      let modelsPattern = join(process.cwd(), `.`) + `/packages/` + controllerName + `/src/**/*model*.ts`;
      let classObj: { [k: string]: any } = {};
      classObj.className = className;
      classObj.classNameLowered = classObj.className.charAt(0).toLowerCase() + classObj.className.slice(1);
      let propertyExample = ReflectionUtils.getPropertyExample(className, modelsPattern, modelsPattern);
      return propertyExample;
    }

    private async getDTO() {
      let dto: { [k: string]: any }[] = [];
      for (let innerController of this.controllers) {
        let innerDto: {[k: string]: any} = {};
        innerDto.projectName = this.projectName;
        innerDto.models = [];
        innerDto.serviceMethods = [];
        innerDto.createMethods = [];
        innerDto.getByIdMethods = [];
        innerDto.getAllMethods = [];
        innerDto.name = innerController.name.substring(0, innerController.name.lastIndexOf("-cc"));

        let modelClasses = await this.getModelClasses(innerController.name);

        for (let modelClass of modelClasses) {
          let modelObj = await this.getModelPropertiesDescription(innerController.name, modelClass.getName()); 
          innerDto.models.push(modelObj);
        }

        let controllerMethods = await this.getMethods(innerController.name);

        for (let method of controllerMethods) {

          if (method.getDecorator("GetAll")) {
            let getAllObj: {[k: string]: any} = {};
            getAllObj.methodParameterType = method.getDecorator("GetAll").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            getAllObj.methodParameterTypeLowered = method.getDecorator("GetAll").getArguments()[0].getText().replace(/[ '|\" ]/g, '').toLowerCase();
            innerDto.getAllMethods.push(getAllObj);
          } else if (method.getDecorator("GetById")) {
            let getByIdObj: {[k: string]: any} = {};
            getByIdObj.methodParameterType = method.getDecorator("GetById").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            getByIdObj.methodParameterTypeLowered = method.getDecorator("GetById").getArguments()[0].getText().replace(/[ '|\" ]/g, '').toLowerCase();
            innerDto.getByIdMethods.push(getByIdObj);
          } else if (method.getDecorator("Create")) {
            // console.log("è un creator");
            let createObj: {[k: string]: any} = {};
            createObj.methodName = method.getName();
            createObj.methodParameterType = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            createObj.methodParameterTypeLowered = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '').toLowerCase();
            innerDto.createMethods.push(createObj);
          } else if (method.getDecorator("Service")) {
            let serviceMethodParameters:{[k: string]: any} [] = [];
            let serviceObj: {[k: string]: any} = {};
            serviceObj.methodName = method.getName();
            serviceObj.methodWithParameters = false;
            serviceObj.methodEndPoint = serviceObj.methodName;
            let parametersForEndpoint: string = "";
            let first : boolean = true;
            method.getParameters().forEach(async function(parameter){
              serviceObj.methodWithParameters = true;
              let param: {[k: string]: any} = {};;
              param.name = parameter.getName();
              if (parameter.getType().getArrayType() != undefined) {
                param.type = "array";
                param.itemType = parameter.getType().getArrayType().getText().substring(parameter.getType().getArrayType().getText().lastIndexOf(".")+1);
                console.log("invoking get example for " + serviceObj.methodName + " param: " + parameter.getType().getText().substring(parameter.getType().getText().lastIndexOf(".")+1));
                param.example = SmartApiSwaggerYamlModels.getPropertyExample(innerController.name, parameter.getType().getText().substring(parameter.getType().getText().lastIndexOf(".")+1));
              }
              else {
                param.type =  parameter.getType().getText().substring(parameter.getType().getText().lastIndexOf(".")+1);
                param.example = SmartApiSwaggerYamlModels.getPropertyExample(innerController.name, param.type);
              }
              //console.log("pushing " + param.name);

              serviceMethodParameters.push(param);
              //console.log("serviceMethodParameters prima:" + serviceMethodParameters);


              if (first) {
                parametersForEndpoint = "/" + "{" + parameter.getName() + "}";
                first = false;
              }
              else {
                parametersForEndpoint = parametersForEndpoint.concat("/{").concat(parameter.getName())+ "}";
              }
            });
            serviceObj.methodParameters = serviceMethodParameters;
            
            //console.log("serviceMethodParameters :" + serviceObj.methodParameters);

            // serviceObj.methodEndPoint = serviceObj.methodEndPoint + parametersForEndpoint;
            //console.log("methodParameters len dopo:" + serviceObj.methodParameters.length);
            innerDto.serviceMethods.push(serviceObj);
          }
          else {
            continue;
          }
        }
        dto.push(innerDto);
      }
      return dto;
    }

}
