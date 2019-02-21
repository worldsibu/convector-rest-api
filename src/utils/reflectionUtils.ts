import { join, relative } from 'path';
import { Project, ImportDeclaration, ClassDeclaration, MethodDeclaration, PropertyDeclarationStructure, SourceFile } from "ts-simple-ast";

export module ReflectionUtils {

  /** Check if a file exists.
   * @returns Promise<boolean>
  */
  export function getClassNames(pathPattern: string): Promise<string[]> {
    return new Promise(function (fulfilled, rejected) {
      let classNames: string[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        classNames.push(sourceFile.getClasses()[0].getStructure().name);
      }
      fulfilled(classNames);
    });
  }

  export function getFirstClass(pathPattern: string): Promise<ClassDeclaration> {
    return new Promise(function (fulfilled, rejected) {
      let classes: ClassDeclaration[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        classes.push(sourceFile.getClasses()[0]);
      }
      fulfilled(classes[0]);
    });
  }

  export function getImportDeclarations(pathPattern: string): Promise<ImportDeclaration[]> {
    return new Promise(function (fulfilled, rejected) {
      let imports: ImportDeclaration[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        Array.prototype.push.apply(imports, sourceFile.getImportDeclarations());
      }
      fulfilled(imports);
    });
  }

  export function getClassImportDeclarations(pathPattern: string, className: string): Promise<ImportDeclaration[]> {
    return new Promise(function (fulfilled, rejected) {
      let imports: ImportDeclaration[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        let sourceFileClasses = sourceFile.getClasses();
        for (let sourceFileClass of sourceFileClasses) {
          if (sourceFileClass.getName() == className) {
            Array.prototype.push.apply(imports, sourceFile.getImportDeclarations());
            //break;
          }
        }
      }
      fulfilled(imports);
      });
  }

  export function getClass(pathPattern: string, className: string): Promise<ClassDeclaration> {
    return new Promise(function (fulfilled, rejected) {
      let classes: ClassDeclaration[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        //console.log("classes:"  + sourceFile.getClasses());
        Array.prototype.push.apply(classes, sourceFile.getClasses());
      }
      //console.log("classes:"  + classes);
      for (let i in classes) {
        if (classes[i].getName().indexOf(className) >= 0) {
          return fulfilled(classes[i]);
        }
      }
      return fulfilled(null);
    });
  }

  export function getClassFromSource(sourceFile: SourceFile, className: string): Promise<ClassDeclaration> {
    return new Promise(function (fulfilled, rejected) {
      let classes = sourceFile.getClasses();
      //console.log("className:"  + className);
      //console.log("classes:"  + classes);
      for (let i in classes) {
        //console.log("classes[" + i + "] = " + classes[i].getName());
        if (classes[i].getName().indexOf(className) >= 0) {
          //console.log("getClassFromSource found class " + className);
          return fulfilled(classes[i]);
        }
      }
      return fulfilled(null);
    });
  }

  export function getClasses(pathPattern: string): Promise<ClassDeclaration[]> {
    return new Promise(function (fulfilled, rejected) {
      let classes: ClassDeclaration[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        Array.prototype.push.apply(classes,sourceFile.getClasses());
      }
      fulfilled(classes);
    });
  }

  /** Check if a file exists.
   * @returns Promise<boolean>
  */
  export function getClassMethods(pathPattern: string, className: string): Promise<MethodDeclaration[]> {
    return new Promise(function (fulfilled, rejected) {
      let methods: MethodDeclaration[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      let sourceFile = sourceFiles[0];
      const classClass = sourceFile.getClassOrThrow(className);
      methods = classClass.getMethods();
      fulfilled(methods);
    });
  }

  //deve essere settato il path preciso
  export function getClassParameters(pathPattern: string, className: string): Promise<PropertyDeclarationStructure[]> {
    return new Promise(function (fulfilled, rejected) {
      let properties: PropertyDeclarationStructure[] = [];
      const project = new Project({});
      project.addExistingSourceFiles(pathPattern);
      let sourceFiles = project.getSourceFiles();
      //console.log("sourceFiles: " + sourceFiles);
      let sourceFile = sourceFiles[0];
      const classClass = sourceFile.getClassOrThrow(className);
      properties = classClass.getStructure().properties;
      //console.log("className: " + className);
      for (let prop of properties) {
        //console.log("prop name: " + prop.name);
        let propType;
        if (prop.type == undefined) {
          propType = 'string';
        }
        else {
          propType = prop.type;
        }
        //console.log("prop type: " + propType);
      }

      fulfilled(properties);
    });
  }

  //deve essere settato il path preciso
  export function getClassParametersFull(pathPattern: string, className: string, fullClassProperties: PropertyDeclarationStructure[]): Promise<PropertyDeclarationStructure[]> {
    return new Promise(async function (fulfilled, rejected) {

      let classClass = await getClass(pathPattern, className);
      let classClassStructure = classClass.getStructure();
      fullClassProperties = classClassStructure.properties;

      if (classClassStructure.extends == undefined) {
        return fulfilled(fullClassProperties);
      }
      else {
        let baseClassName = classClassStructure.extends.substring(0, classClassStructure.extends.indexOf("<"));
        let importDeclarations: ImportDeclaration[] = [];
        importDeclarations = await ReflectionUtils.getClassImportDeclarations(pathPattern,  className);
        for (let importDeclaration of importDeclarations) {
          if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
            let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
            let baseClassSource = join(__dirname,  `.`) +`/../../node_modules/` + moduleSpecifier + "/**/*.ts*";
            let returnArray = fullClassProperties.concat(await getClassParametersFull(baseClassSource, baseClassName, fullClassProperties));
            return fulfilled(removeDuplicates(returnArray));
          }
        }
      }
    });
  }

  // export function getClassParametersFullFromClass(classClass: ClassDeclaration): Promise<PropertyDeclarationStructure[]> {
  //   return new Promise(async function (fulfilled, rejected) {
  //
  //
  //     let classClassStructure = classClass.getStructure();
  //     let fullClassProperties = classClassStructure.properties;
  //
  //     if (classClassStructure.extends == undefined) {
  //       return fulfilled(fullClassProperties);
  //     }
  //     else {
  //       let baseClassName = classClassStructure.extends.substring(0, classClassStructure.extends.indexOf("<"));
  //       let importDeclarations: ImportDeclaration[] = [];
  //
  //       importDeclarations = classClass.getSourceFile().getImportDeclarations();
  //
  //       for (let importDeclaration of importDeclarations) {
  //         if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
  //           let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
  //           let baseClassSource = join(__dirname,  `.`) +`/../../node_modules/` + moduleSpecifier + "/**/*.ts*";
  //           let returnArray = fullClassProperties.concat(await getClassParametersFull(baseClassSource, baseClassName, fullClassProperties));
  //           return fulfilled(removeDuplicates(returnArray));
  //         }
  //       }
  //     }
  //   });
  // }


  function removeDuplicates(arr){
      let unique_array = [];
      let unique_names_array = [];

      for(let i = 0;i < arr.length; i++){
          if(unique_names_array.indexOf(arr[i].name) == -1){
              unique_names_array.push(arr[i].name);
              unique_array.push(arr[i]);
          }
      }
      return unique_array
  }

}
