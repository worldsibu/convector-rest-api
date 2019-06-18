#!/usr/bin/env node
import * as program from 'commander';
import { RestApi } from './restApi';
import * as updateNotifier from 'update-notifier';
import { join } from 'path';
import { d } from './utils/debug';
const pkg = require('../package.json');

const tasks = {
    async generateApi(projectName: string, chaincode: string, chaincodeConfigFile:string) {
        d('in generateApi in command.ts chaincode=' + chaincode);
        d('in generateApi in command.ts chaincodeConfigFile=' + chaincodeConfigFile);
        return await RestApi.generateApi(projectName, chaincode, chaincodeConfigFile);
     }
};

program
    .command('generate <object>')
    .option('-c, --chaincode <chaincode>', 'Chaincode project')
    .option('-p, --projectname <projectname>', 'name of the API project')
    .option('-f, --chaincodeConfigFile <chaincodeConfigFile>', 'name of the chaincode configuration file')
    .action(async (object: string, cmd: any) => {
        if ((!cmd || !cmd.chaincode) && object == 'api') {
            throw new Error('Please specify the chaincode project with the parameter -c');
        }
        if ((!cmd || !cmd.projectname) && object == 'api') {
            throw new Error('Please specify the project name with the parameter -p');
        }
        if ((!cmd || !cmd.chaincodeConfigFile) && object == 'api') {
            cmd.chaincodeConfigFile = 'org1.' + cmd.chaincode + '.config.json';
            d('cmd.chaincodeConfigFile=='+cmd.chaincodeConfigFile);
        }
        switch (object) {
            case 'api':
                return await tasks.generateApi(
                    cmd.projectname,
                    cmd.chaincode,
                    cmd.chaincodeConfigFile);
            default:
                // tslint:disable-next-line:max-line-length
                throw new Error(`Option ${object} is not a valid generator. Try with 'api'.`);
        }
    });

updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60
}).notify();

program.parse(process.argv);
