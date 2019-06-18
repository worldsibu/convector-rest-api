import { BaseGenerator } from './base';

export class ConvectorOptions {
    controllers: { [k: string]: any }[];
}

export class ConvectorTsGenerator extends BaseGenerator {
    contents = `import { join, resolve } from "path";
import { keyStore, identityName, channel, chaincode, networkProfile, identityId } from './env';
import * as fs from 'fs';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { ClientFactory } from '@worldsibu/convector-core';
${this.options.controllers.map(controller => `import { ${controller.controller} } from '${controller.name}';
`).join('')}

const adapter = new FabricControllerAdapter({
    txTimeout: 300000,
    user: identityName,
    channel,
    chaincode,
    keyStore: resolve(__dirname, keyStore),
    networkProfile: resolve(__dirname, networkProfile)
    // userMspPath: keyStore
});

export const initAdapter = adapter.init();

${this.options.controllers.map(controller => `
export const ${controller.controller}BackEnd = 
    ClientFactory(${controller.controller}, adapter);
`).join('')}

const contextPath = join(keyStore + '/' + identityName);
fs.readFile(contextPath, 'utf8', async function (err, data) {
    if (err) {
        throw new Error('Context in ' + contextPath 
        + ' does not exist. Make sure that path resolves to your key stores folder');
    } else {
        console.log('Context path with cryptographic materials exists');
    }
});

    `;

    constructor(filename: string, path: string, private options: ConvectorOptions) {
        super(filename, path);
    }
}