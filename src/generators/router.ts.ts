import { BaseGenerator } from './base';
import { ApiConfigurationItem, HTTP_VERBS } from '../models/apiConfigurationFile';
import { join } from 'path';
import { ReflectionUtils } from '../utils';

export class RouterTsOptions {
    config: ApiConfigurationItem[];
}
export class RouterTsGenerator extends BaseGenerator {
    contents = `import * as express from 'express';
import { ${this.options.config.map(item => `
    ${item.controller}_${item.function}`).join(',')} } from './controllers'
export default express.Router()${this.options.config.map(item => `
.${item.verb}('/${item.plainController}/${item.function}${item.params && item.verb === HTTP_VERBS.GET ?
            item.params.map(param => `/:` + param.name).join('')
            : ''}', ${item.controller}_${item.function})`).join('')}
`;

    constructor(filename: string, path: string, private options: RouterTsOptions) {
        super(filename, path);
    }
}