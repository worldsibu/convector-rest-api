import { BaseGenerator } from './base';
import { ApiConfigurationItem, HTTP_VERBS } from '../models/apiConfigurationFile';
import { join } from 'path';
import { ReflectionUtils } from '../utils';

export class ControllerTsOptions {
    controllers: { [k: string]: any }[];
    config: ApiConfigurationItem[];
}
export class ControllerTsGenerator extends BaseGenerator {
    contents = `import { Request, Response } from 'express';
${this.options.controllers.map(controller => `import { ${controller.controller}BackEnd } from '../convector';
`).join('')}
${this.options.config.map(item => `
export async function ${item.controller}_${item.function}(req: Request, res: Response): Promise<void>{
    try{
        ${item.verb === HTTP_VERBS.GET ? `let params = req.params;
        res.status(200).send(await ${item.controller}BackEnd
            .${item.function}(${item.params ? item.params.map(param => `params.` + param.name).join(',') : ''}));
        ` :
            !item.verb || item.verb === HTTP_VERBS.POST || item.verb === HTTP_VERBS.PUT ? `let params = req.body;
            res.status(200).send(await ${item.controller}BackEnd
                .${item.function}(${item.params ? item.params.map(param => `params.` + param.name).join(',') : ''}));
            `: ''}
    } catch(ex) {
        console.log('Error ${item.verb} ${item.controller}_${item.function}', ex.stack);
    }
}`).join('')}`;

    constructor(filename: string, path: string, private options: ControllerTsOptions) {
        super(filename, path);
    }
}