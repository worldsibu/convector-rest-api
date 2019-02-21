import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';

/** Model compiler object. */
export class SmartContractControllers extends SmartModel
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
    get controllerClient()
    {
        return this.chaincodeName.match(/[a-z]+/gi)
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + 'ControllerClient';
            })
            .join('');
    }

    get chaincodeClientFolder()
    {
        return this.chaincodeName.match(/[a-z]+/gi)
            .map(function (word) {
                return word + '-cc/client';
            })
            .join('');
    }

    get controllerName()
    {
        return this.chaincodeName.match(/[a-z]+/gi)
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + 'Controller';
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
        return join(__dirname, '../../templates/_smartContractControllers.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath()
    {
        return `${this.projectRoot}/packages/${this.applicationName}/server/smartContractControllers.ts`;
    }

    private getDTO()
    {
        let dto: {[k: string]: any} = {};
        dto.controllerClient = this.controllerClient;
        dto.chaincodeClientFolder = this.chaincodeClientFolder;
        dto.controllerName = this.controllerName;
        return dto;
    }
}
