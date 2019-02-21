#!/usr/bin/env node
import * as program from 'commander';
import { RestApi } from './restApi';
import * as updateNotifier from 'update-notifier';
const pkg = require('../package.json');

const tasks = {
    async generateApi(projectName: string, chaincode: string) {
        console.log("in generateApi in command.ts chaincode=" + chaincode)
        return await RestApi.generateApi(projectName, chaincode);
    },
    async compileApiApplication(chaincode: string) {
        console.log("in compileApiApplication in command.ts chaincode=" + chaincode)
        return await RestApi.compileApiApplication(chaincode);
    },
    async startApiApplication(chaincode: string) {
        console.log("in startApiApplication in command.ts chaincode=" + chaincode)
        return await RestApi.startApiApplication(chaincode);
    }
};

program
    .command('generate <object>')
    .option('-c, --chaincode <chaincode>', 'Chaincode project')
    .option('-p, --projectname <projectname>', 'name of the API project')
    .action(async (object: string, cmd: any) => {
        console.log("cmd.chaincode=" + cmd.chaincode);
        console.log("cmd.projectname=" + cmd.projectname);
        if ((!cmd || !cmd.chaincode) && object == 'api') {
            throw new Error('Please specify the chaincode project with the parameter -c');
        }
        if ((!cmd || !cmd.projectname) && object == 'api') {
            throw new Error('Please specify the project name with the parameter -p');
        }
        switch (object) {
            case 'api':
                return await tasks.generateApi(
                    cmd.projectname,
                    cmd.chaincode);
            default:
                // tslint:disable-next-line:max-line-length
                throw new Error(`Option ${object} is not a valid generator. Try with 'api'.`);
        }
    });

program
    .command('compile <chaincode>')
    .action(async (chaincode: string) => {
        await tasks.compileApiApplication(
            chaincode);
    });

program
    .command('start <chaincode>')
    .action(async (chaincode: string) => {
        await tasks.startApiApplication(
            chaincode);
    });

    updateNotifier({
        pkg,
        updateCheckInterval: 1000 * 60
    }).notify();

    program.parse(process.argv);
