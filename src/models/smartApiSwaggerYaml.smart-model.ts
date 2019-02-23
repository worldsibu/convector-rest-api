import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { ClassDeclaration, MethodDeclaration } from "ts-simple-ast";


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
        public modelNames: string[],
        public modelClasses: ClassDeclaration[],
        public methods: MethodDeclaration[],
        public ignoreConvention?: boolean) {
        super(name, projectName);
    }

    recompile() {
        throw new Error('Method not implemented.');
    }

    async save() {
        // let dto = JSON.stringify(this.getDTO(), null, 4);
        this.dto = this.getDTO();
        console.log("DTO==" + this.dto);
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

    private getDTO() {
      let dto: {[k: string]: any} = {};
      dto.projectName = this.projectName;
      dto.models = [];
      dto.serviceMethods = [];


      for (let modelClass of this.modelClasses) {
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

            if (property.getType().getText() == undefined || property.getType().getText()=='string') {
              modelPropertyObj.propType = 'string';
              modelPropertyObj.propExample = 'a_text';
            }
            else if (property.getType().getText() == 'number') {
              modelPropertyObj.propType = 'number';
              modelPropertyObj.propExample = '123';
            }
            else {
              modelPropertyObj.propType = property.getType().getText();
              modelPropertyObj.propExample = 'null'
            }
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

          if (property.type == undefined || property.type=='string') {
            modelPropertyObj.propType = 'string';
            modelPropertyObj.propExample = 'a_text';
          }
          else if (property.type == 'number') {
            modelPropertyObj.propType = 'number';
            modelPropertyObj.propExample = '123';
          }
          else {
            modelPropertyObj.propType = property.type;
            modelPropertyObj.propExample = 'null'
          }
          modelObj.modelProperties.push(modelPropertyObj);
          modelPropertiesNames.push(property.name);
        }
        dto.models.push(modelObj);
      }
      for (let method of this.methods) {
        if (method.getDecorator("Service")) {
          let serviceObj: {[k: string]: any} = {};
          serviceObj.methodName = method.getName();
          serviceObj.methodEndPoint = serviceObj.methodName;
          let parameters = [];
          let parametersForEndpoint: string = "";
          let first : boolean = true;
          method.getParameters().forEach(function(parameter){
            let param: {[k: string]: any} = {};;
            param.name = parameter.getName();
            param.type = parameter.getSymbol().getName();
            parameters.push(param);
            if (first) {
              parametersForEndpoint = "/" + "{" + parameter.getName() + "}";
              first = false;
            }
            else {
              parametersForEndpoint = parametersForEndpoint.concat("/{").concat(parameter.getName())+ "}";
            }
          });
          serviceObj.methodEndPoint = serviceObj.methodEndPoint + parametersForEndpoint;
          serviceObj.methodParameters = parameters;
          dto.serviceMethods.push(serviceObj);
        }
      }
      return dto;
    }
}
