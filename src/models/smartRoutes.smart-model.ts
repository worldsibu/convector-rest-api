import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';

/** Model compiler object. */
export class SmartRoutesModels extends SmartModel {

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
        public ignoreConvention?: boolean) {
        super(name, projectName);
    }

    recompile() {
        throw new Error('Method not implemented.');
    }

    async save() {
        await SysWrapper.createFileFromTemplate(
            this.filePath,
            {
                projectName: this.projectName
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
        return join(__dirname, '../../templates/_smartRoutes.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath() {
        return `packages/${this.applicationName}/server/routes.ts`;
    }
}
