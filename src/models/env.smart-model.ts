import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from '../models/smartModel';
import { ApiConfig } from "../utils/apiConfig";
import { ApiEnvironment } from "../utils/apiEnvironment";


/** Model compiler object. */
export class EnvModel extends SmartModel
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
        public ignoreConvention?: boolean)
    {
        super(name, projectName);
        //console.log("************apiConfig***********" + apiConfig);
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
                apiEnvironment: this.selectedApiConfig
            }, this.templateFile);
    }

    /** TypeScript classs. */
    get applicationName()
    {
        return this.chaincodeName.match(/[a-z]+/gi)
            .map(function (word) {
                return word + '-app';
            })
            .join('');
    }

    /** TypeScript classs. */
    get selectedApiConfig()
    {
         let apiConfig: ApiConfig = require(`${this.projectRoot}/`+ 'api.json');
         let selectedEnv = apiConfig.selected;
         let currentEnvObject: ApiEnvironment;

         for (let environment of apiConfig.environments) {
           if (environment.name == selectedEnv) {
             currentEnvObject = environment;
             break;
           }
         }
         return currentEnvObject;

    }

    /**
     * Static template file to be used.
     */
    get templateFile()
    {
        return join(__dirname, '../../templates/_.env.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath()
    {
        return `${this.projectRoot}/packages/${this.applicationName}/.env`;
    }

    
}
