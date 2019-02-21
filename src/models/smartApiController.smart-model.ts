import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { MethodDeclaration } from "ts-simple-ast";

/** Model compiler object. */
export class SmartApiController extends SmartModel
{

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
        return join(__dirname, '../../templates/_smartApiController.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath()
    {
        return `${this.projectRoot}/packages/${this.applicationName}/server/api/controllers/examples/controller.ts`;
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
            //console.log("è un getterAll");
            getAllMethods.push(method.getName());
          } else if (method.getDecorator("GetById")) {
            //console.log("è un getterById");
            getByIdMethods.push(method.getName());
          } else if (method.getDecorator("Create")) {
            //console.log("è un creator");
            let createObj: {[k: string]: any} = {};
            createObj.methodName = method.getName();
            createObj.methodParameterType = method.getDecorator("Create").getArguments()[0].getText().replace(/[ '|\" ]/g, '');
            console.log(JSON.stringify(createObj));
            createMethods.push(createObj);
          }
          else if (method.getDecorator("Service")){
            console.log( method.getName() + " è un service");
            let serviceObj: {[k: string]: any} = {};
            serviceObj.methodName = method.getName();
            serviceObj.parameters = method.getParameters();
            //console.log(JSON.stringify(serviceObj));
            serviceMethods.push(serviceObj);
          }
          let methodParameters = method.getParameters();
          if (methodParameters.length == 0) {
            //console.log("niente parametri!!!");
          }
          for (let j of methodParameters) {
            //console.log("param name: " + j.getName());
            let paramTypeSymbol = j.getType().getSymbol();
            if (paramTypeSymbol == undefined) {
              //console.log("param type: " + j.getType().getText());
            }
            else {
              //console.log("param type symbol: " + paramTypeSymbol.getName());
            }
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
