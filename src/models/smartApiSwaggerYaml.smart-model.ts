import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { ClassDeclaration, MethodDeclaration } from "ts-simple-ast";

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
          let modelObj: {[k: string]: any} = {};;
          modelObj.modelName = modelClass.getStructure().name;
          modelObj.modelNameLowered = modelObj.modelName.charAt(0).toLowerCase() + modelObj.modelName.slice(1);
          modelObj.modelProperties = [];

          let modelPropertiesNames: string[] = [];

          let baseClass = modelClass.getBaseClass();

          if (baseClass != undefined) {
            let baseClassProperties = baseClass.getProperties();

            for (let property of baseClassProperties) {
              if (modelPropertiesNames.indexOf(property.getName()) >= 0 || property.getName() == 'type' ) {
                continue;
              }

              let modelPropertyObj: {[k: string]: any} = {};
              modelPropertyObj.propName = property.getName();

              if (property.getType().getText() == undefined) {
                modelPropertyObj.propType = 'string';
              }
              else {
                modelPropertyObj.propType = property.getType().getText();
              }

              modelPropertyObj.propExample = SmartApiSwaggerYamlModels.getPropertyExample(modelPropertyObj.propType);

              modelObj.modelProperties.push(modelPropertyObj);
              modelPropertiesNames.push(property.getName());
            }
          }

          for (let property of modelClass.getStructure().properties) {

            if (modelPropertiesNames.indexOf(property.name) >= 0  || property.name == 'type' ) {
              continue;
            }

            let modelPropertyObj: {[k: string]: any} = {};;
            modelPropertyObj.propName = property.name;
            if (property.type == undefined) {
              modelPropertyObj.propType = 'string';
            }
            else {
              modelPropertyObj.propType = property.type;
            }

            modelPropertyObj.propExample = SmartApiSwaggerYamlModels.getPropertyExample(modelPropertyObj.propType);

            modelObj.modelProperties.push(modelPropertyObj);
            modelPropertiesNames.push(property.name);
          }
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
            //console.log("è un creator");
            let createObj: {[k: string]: any} = {};
            createObj.methodName = method.getName();
            createObj.methodParameterType = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            createObj.methodParameterTypeLowered = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '').toLowerCase();
            innerDto.createMethods.push(createObj);
          } else if (method.getDecorator("Service")) {
            let serviceObj: {[k: string]: any} = {};
            serviceObj.methodName = method.getName();
            serviceObj.methodEndPoint = serviceObj.methodName;
            let parameters = [];
            let parametersForEndpoint: string = "";
            let first : boolean = true;
            method.getParameters().forEach(function(parameter){
              let param: {[k: string]: any} = {};;
              param.name = parameter.getName();
              param.type = parameter.getType().getText();
              param.example = SmartApiSwaggerYamlModels.getPropertyExample(param.type);

              parameters.push(param);
              if (first) {
                parametersForEndpoint = "/" + "{" + parameter.getName() + "}";
                first = false;
              }
              else {
                parametersForEndpoint = parametersForEndpoint.concat("/{").concat(parameter.getName())+ "}";
              }
            });
            // serviceObj.methodEndPoint = serviceObj.methodEndPoint + parametersForEndpoint;
            serviceObj.methodParameters = parameters;
            innerDto.serviceMethods.push(serviceObj);
          }
        }
        dto.push(innerDto);
      }
      return dto;
    }

    private static  getPropertyExample(propertyType: string) {
      if (propertyType == undefined || propertyType=='string') {
        return  'a_text';
      }
      else if (propertyType == 'number') {
        return  '123';
      }
      else {
        return 'null'
      }
    }
}
