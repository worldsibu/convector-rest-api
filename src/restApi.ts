import { ApiGenerator } from './apiGenerator';
import { Analytics } from './utils/analytics';
import { SysWrapper } from './utils/sysWrapper';

export class RestApi {

    static async generateApi(projectName: string, chaincode: string) {
        const restApi = new RestApi(projectName, chaincode);
        await restApi.generateApi(projectName, chaincode);
        return restApi;
    }

    analytics: Analytics;

    /**
     *
     * @param name Project Name
     * @param chaincode File Name
     */
    constructor(public name?: string, public chaincode?: string) {
        this.analytics = new Analytics();
        this.chaincode = this.chaincode || this.name;
    }

    public async generateApi(projectName, chaincode) {
      let apiGenerator = new ApiGenerator(this.name, projectName, chaincode);
      await apiGenerator.generate();
    }

    public static async compileApiApplication(chaincode) {
      let command = 'npx';
      let tags = ['lerna', 'run', 'compile', '--scope', chaincode + '-app'];
      await SysWrapper.executeCommand(command, tags);
    }

    public static async startApiApplication(chaincode) {
      let command = 'npx';
      let tags = ['lerna', 'run', 'dev', '--scope', chaincode + '-app', '--stream'];
      await SysWrapper.executeCommand(command, tags);
    }

}
