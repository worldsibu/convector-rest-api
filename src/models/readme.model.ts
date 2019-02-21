// tslint:disable:max-line-length
import { join } from 'path';
import { SysWrapper } from '../utils/sysWrapper';
import { SmartModel } from './smartModel';

/** Controller compiler object. */
export class ReadmeModel extends SmartModel
{
    constructor(
        public name: string,
        public projectName?: string,
        public ignoreConvention?: boolean)
    {
        super(name, projectName);
    }

    /** Save to disk. */
    async save()
    {
        await SysWrapper.createFile(
            this.filePath,
            `# ${this.projectName} - ${this.name}

This awesome project was created automatically with <a href="https://github.com/worldsibu/convector-rest-api" target="_blank">Convector Rest API</a>.

`);
    }

    /**
     * Static template file to be used.
     */
    get templateFile()
    {
        return join(__dirname, '../../templates/_controller.ts.ejs');
    }

    /** Actual file Path for the object. */
    get filePath()
    {
        if (!this.ignoreConvention) {
            return `${this.projectRoot}/README.md`;
        } else {
            return join(process.cwd(), `README.md`);
        }
    }
}
