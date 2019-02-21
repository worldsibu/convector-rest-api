import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { MethodDeclaration } from "ts-simple-ast";

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
        public methods: MethodDeclaration[],
        public controllerClassName: string,
        public ignoreConvention?: boolean)
    {
      super(name, projectName);
    }

    recompile()
    {
      throw new Error('Method not implemented.');
    }

    async save()
    {
        await SysWrapper.createFileFromTemplate(
            this.filePath,
            {
                dto: this.getDTO()

            }, this.templateFile);
    }

    /** TypeScript classs. */

    get chaincodeClientFolder()
    {
        return this.chaincodeName.match(/[a-z]+/gi)
            .map(function (word) {
                return word + '-cc/client';
            })
            .join('');
    }

    get applicationName()
    {
        return this.chaincodeName.match(/[a-z]+/gi)
            .map(function (word) {
                return word + '-app';
            })
            .join('');
    }
    /**
     * Static template file to be used.
     */
    get templateFile()
    {
        return join(__dirname, '../../templates/_smartRouter.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath()
    {
        return `${this.projectRoot}/packages/${this.applicationName}/server/api/controllers/examples/router.ts`;
    }

    private getDTO()
    {
        let dto: {[k: string]: any} = {};
        let getAllMethods = [];
        let getByIdMethods = [];
        let createMethods = [];
        let serviceMethods = [];

        for (let method of this.methods) {
          //console.log("method name: " + method.getName());
          if (method.getDecorator("GetAll")) {
            let getAllObj: {[k: string]: any} = {};
            getAllObj.methodName = method.getName();
            getAllObj.methodClassName = method.getDecorator("GetAll").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            getAllObj.methodEndPoint = getAllObj.methodClassName.charAt(0).toLowerCase() + getAllObj.methodClassName.slice(1) + 's';
            getAllMethods.push(getAllObj);
          } else if (method.getDecorator("GetById")) {
            let getIdObj: {[k: string]: any} = {};
            getIdObj.methodName = method.getName();
            getIdObj.methodClassName = method.getDecorator("GetById").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            getIdObj.methodEndPoint = getIdObj.methodClassName.charAt(0).toLowerCase() + getIdObj.methodClassName.slice(1) + 's';
            getByIdMethods.push(getIdObj);
          } else if (method.getDecorator("Create")) {
            //console.log("è un creator");
            let createObj: {[k: string]: any} = {};
            createObj.methodName = method.getName();
            createObj.methodClassName = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            createObj.methodEndPoint = createObj.methodClassName.charAt(0).toLowerCase() + createObj.methodClassName.slice(1) + 's';
            createMethods.push(createObj);
          }
          else if (method.getDecorator("Service")) {
            let serviceObj: {[k: string]: any} = {};
            serviceObj.methodName = method.getName();
            serviceObj.methodEndPoint = serviceObj.methodName;
            let parameters: string = "";
            let first : boolean = true;
            method.getParameters().forEach(function(parameter){
              if (first) {
                parameters = "/" + ":" + parameter.getName();
                first = false;
              }
              else {
                parameters = parameters.concat("/:").concat(parameter.getName());
              }
            });
            serviceObj.methodEndPoint = serviceObj.methodEndPoint + parameters;
            console.log("methodEndPoint = " + serviceObj.methodEndPoint);
            serviceMethods.push(serviceObj);
          }
        }

        dto.controllerClassName = this.controllerClassName;
        dto.getAllMethods = getAllMethods;
        dto.getByIdMethods = getByIdMethods;
        dto.createMethods = createMethods;
        dto.serviceMethods = serviceMethods;

        return dto;
      }

}
