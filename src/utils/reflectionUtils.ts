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
      ////console.log("sourceFiles: " + sourceFiles);
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
      ////console.log("sourceFiles: " + sourceFiles);
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
      ////console.log("sourceFiles: " + sourceFiles);
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
      //console.log("imports: " + imports);

      fulfilled(imports);
      });
  }

  export function getClass(pathPattern: string, className: string): ClassDeclaration {
    let classes: ClassDeclaration[] = [];
    const project = new Project({});
    project.addExistingSourceFiles(pathPattern);
    let sourceFiles = project.getSourceFiles();
    ////console.log("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      ////console.log("classes:"  + sourceFile.getClasses());
      Array.prototype.push.apply(classes, sourceFile.getClasses());
    }
    ////console.log("classes:"  + classes);
    for (let i in classes) {
      // //console.log("class name to be found=" + className);
      // //console.log("class[" + i + "]=" + classes[i]);

      if (classes[i].getName().indexOf(className) >= 0) {
        // //console.log("class name found!=" + className);
        return classes[i];
      }
    }
    // //console.log("class name not found :((( =" + className);
    return null;
  }

  export function getClassFromSource(sourceFile: SourceFile, className: string): Promise<ClassDeclaration> {
    return new Promise(function (fulfilled, rejected) {
      let classes = sourceFile.getClasses();
      ////console.log("className:"  + className);
      ////console.log("classes:"  + classes);
      for (let i in classes) {
        ////console.log("classes[" + i + "] = " + classes[i].getName());
        if (classes[i].getName().indexOf(className) >= 0) {
          ////console.log("getClassFromSource found class " + className);
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
      ////console.log("sourceFiles: " + sourceFiles);
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
      ////console.log("sourceFiles: " + sourceFiles);
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
      ////console.log("sourceFiles: " + sourceFiles);
      let sourceFile = sourceFiles[0];
      const classClass = sourceFile.getClassOrThrow(className);
      properties = classClass.getStructure().properties;
      ////console.log("className: " + className);
      for (let prop of properties) {
        ////console.log("prop name: " + prop.name);
        let propType;
        if (prop.type == undefined) {
          propType = 'string';
        }
        else {
          propType = prop.type;
        }
        ////console.log("prop type: " + propType);
      }

      fulfilled(properties);
    });
  }

  //deve essere settato il path preciso
  // export function getClassParametersFull(pathPattern: string, className: string, fullClassProperties: PropertyDeclarationStructure[]): Promise<PropertyDeclarationStructure[]> {
  //   return new Promise(async function (fulfilled, rejected) {

  //     let classClass = await getClass(pathPattern, className);
  //     let classClassStructure = classClass.getStructure();
  //     fullClassProperties = classClassStructure.properties;

  //     if (classClassStructure.extends == undefined) {
  //       return fulfilled(fullClassProperties);
  //     }
  //     else {
  //       let baseClassName = classClassStructure.extends.substring(0, classClassStructure.extends.indexOf("<"));
  //       let importDeclarations: ImportDeclaration[] = [];
  //       importDeclarations = await ReflectionUtils.getClassImportDeclarations(pathPattern,  className);
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

  export function getPropertyExample(propertyType: string, pathPattern: string, alterNativePathPattern: string) {

    //console.log("propertyType==" + propertyType);
    if (propertyType == undefined || propertyType=='string') {
      return  'a_text';
    }
    else if (propertyType == 'number') {
      return  '123';
    }
    else if (propertyType.toString().indexOf("[") >= 0) {
      //console.log("in the array because: " + propertyType.toString());
      let returnExample = "[";
      returnExample +=
         ReflectionUtils.getPropertyExample(propertyType.toString().substring(0, propertyType.toString().indexOf("[")), pathPattern, alterNativePathPattern) + ", " +
         ReflectionUtils.getPropertyExample(propertyType.toString().substring(0, propertyType.toString().indexOf("[")), pathPattern, alterNativePathPattern)
      ;
      returnExample += "]";
      //console.log("returnExample: " + returnExample + "\nfor " + propertyType.toString());

      return returnExample;
    }
    else {
      let classClass = getClass(pathPattern, propertyType);
      if (classClass == null)  {
        //console.log("class " + className + " not found trying alternative");
        classClass = getClass(alterNativePathPattern, propertyType);
        if (classClass == null)  {
          //console.log("class " + className + " not found !!! exiting");
          return null;
        }
      }
      let classClassStructure = classClass.getStructure();
      let classProperties = classClassStructure.properties;

      let returnExample = "{";
      for (let property of classProperties) {

        if (property.name === 'type') {
          continue;
        }

        returnExample += '\n' + property.name + ': ' +  ReflectionUtils.getPropertyExample(property.type.toString(), pathPattern, alterNativePathPattern) + ',';

      }
      if (returnExample != "{") {
        returnExample = returnExample.slice(0, -1);
      }
      returnExample += "}";

      return returnExample;
    }
  }

  export function getClassParametersDescriptionFull(pathPattern: string, alterNativePathPattern: string, className: string, controllerName:string, classObj: {[k: string]: any}): Promise<{[k: string]: any}> {
    return new Promise(async function (fulfilled, rejected) {

      let classClass = await getClass(pathPattern, className);
      let alernative = false;
      if (classClass == null)  {
        //console.log("class " + className + " not found trying alternative");
        classClass = await getClass(alterNativePathPattern, className);
        if (classClass == null)  {
          //console.log("class " + className + " not found !!! exiting");
          return classObj;
        }
        else {
          alernative = true;
        }
      }
      let classClassStructure = classClass.getStructure();

      let classProperties = classClassStructure.properties;

      //console.log("classObj.classProperties before=" + classObj.classProperties);

      if (classClassStructure.extends != undefined) {
        //console.log(classClassStructure.name + " extends " + classClassStructure.extends);
        let baseClassName = "";
        if (classClassStructure.extends.indexOf("<") >= 0) {
          baseClassName = classClassStructure.extends.substring(0, classClassStructure.extends.indexOf("<"));
        }
        else if (classClassStructure.extends.indexOf("[") >= 0) {
          baseClassName = classClassStructure.extends.substring(0, classClassStructure.extends.indexOf("["));
        }
        else {
          baseClassName = classClassStructure.extends;
        }
        let importDeclarations: ImportDeclaration[] = [];
        //console.log("invoking getClassImportDeclarations");
        if (alernative) {
          importDeclarations = await ReflectionUtils.getClassImportDeclarations(alterNativePathPattern,  className);
        }
        else {
          importDeclarations = await ReflectionUtils.getClassImportDeclarations(pathPattern,  className);
        }

        //console.log("invoked getClassImportDeclarations");

        for (let importDeclaration of importDeclarations) {
          if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
            let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
            let baseClassSource = join(process.cwd(), `.`) + `/node_modules/` + moduleSpecifier + "/**/*.ts*";
            if (alernative) {
              await getClassParametersDescriptionFull(baseClassSource, alterNativePathPattern, baseClassName, controllerName, classObj);
            }
            else {
              await getClassParametersDescriptionFull(baseClassSource, pathPattern, baseClassName, controllerName, classObj);
            }
          }
        }
      }

      for (let property of classProperties) {

        if (property.name === 'type') {
          continue;
        }

        let propertyPresent = false;
        if (classObj.classProperties != undefined) {
          for (let p of classObj.classProperties) {
            if (p.propName == property.name) {
              propertyPresent = true;
              break;
            }
          }
        }

        if (propertyPresent) {
          continue;
        }

        let classPropertyObj: {[k: string]: any} = {};
        classPropertyObj.propName = property.name;

        if (property.type == undefined) {
          classPropertyObj.propType = 'string';
          classPropertyObj.propExample = await ReflectionUtils.getPropertyExample(classPropertyObj.propType, pathPattern, alterNativePathPattern);
        }
        else if (property.type.toString().indexOf("[") >= 0) {
          classPropertyObj.propType = 'array';
          classPropertyObj.propItemType = property.type.toString().substring(0, property.type.toString().indexOf("["));
          classPropertyObj.propExample = "[ " +
            await ReflectionUtils.getPropertyExample(classPropertyObj.propItemType, pathPattern, alterNativePathPattern) + ", " +
            await ReflectionUtils.getPropertyExample(classPropertyObj.propItemType, pathPattern, alterNativePathPattern) + " ]"
          ;
        }
        else {
          classPropertyObj.propType = property.type.toString();
          classPropertyObj.propExample = await ReflectionUtils.getPropertyExample(classPropertyObj.propType,pathPattern, alterNativePathPattern);
        }


        if (classObj.classProperties == undefined) {
          classObj.classProperties = [];
        }
        classObj.classProperties.push(classPropertyObj);
        // modelPropertiesNames.push(property.getName());
      }

     return fulfilled(classObj);
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
