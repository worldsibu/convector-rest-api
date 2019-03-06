import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';

import { ReflectionUtils } from '../utils/reflectionUtils';


/** Model compiler object. */
export class SmartContractModels extends SmartModel {

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
        public ignoreConvention?: boolean)
    {
      super(name, projectName);
    }

    recompile() {
        throw new Error('Method not implemented.');
    }

    async save()
    {
      let dto = await this.getDTO();
        await SysWrapper.createFileFromTemplate(
            this.filePath,
            {
                dto: dto

            }, this.templateFile);
    }

    /** TypeScript classs. */

    private async getModelNames(controllerName: string) {
        let modelsPattern = join(process.cwd(), `.`) + `/packages/`+ controllerName + `/src/**/*model*.ts`;
        let modelNames = await ReflectionUtils.getClassNames(modelsPattern);
        return modelNames;
    }

    private getChaincodeClientFolder(controllerName: string)
    {
        console.log(controllerName + "/dist/client");
        return controllerName + "/dist/client";
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
        return join(__dirname, '../../templates/_smartContractModels.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath()
    {
        return `${this.projectRoot}/packages/${this.applicationName}/server/smartContractModels.ts`;
    }

    private async getDTO()
    {
      let dto: { [k: string]: any }[] = [];
      for (let innerController of this.controllers) {
        let innerDto: { [k: string]: any } = {};
        innerDto.models = await this.getModelNames(innerController.name);
        innerDto.chaincodeClientFolder = this.getChaincodeClientFolder(innerController.name);
        console.log('innerDto.models==' + innerDto.models);
        dto.push(innerDto);
      }
      console.log('dto==' + dto);
      return dto;
    }
}
