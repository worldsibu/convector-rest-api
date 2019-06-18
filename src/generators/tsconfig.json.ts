import { BaseGenerator } from './base';

export class TsConfigJsonGenerator extends BaseGenerator {
    contents = `{
        "extends": "../../tsconfig.json",
        "compilerOptions": {
          "outDir": "./dist",
          "rootDir": "./src",
          "experimentalDecorators": true
        },
        "include": [
          "./src"
        ]
      }`;

    constructor(filename: string, path: string) {
        super(filename, path);
    }
}