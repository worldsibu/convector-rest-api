import { join, relative } from 'path';
import { Project, ImportDeclaration, ClassDeclaration, ClassDeclarationStructure,  MethodDeclaration, EnumDeclaration, PropertyDeclarationStructure, InterfaceDeclaration,InterfaceDeclarationStructure,  SourceFile } from "ts-simple-ast";

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

  export function getClassImportDeclarations(pathPattern: string, className: string): ImportDeclaration[] {
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

      return imports;
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

  export function getEnum(pathPattern: string, enumName: string): EnumDeclaration {
    let enums: EnumDeclaration[] = [];
    const project = new Project({});
    project.addExistingSourceFiles(pathPattern);
    let sourceFiles = project.getSourceFiles();
    ////console.log("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      ////console.log("classes:"  + sourceFile.getClasses());
      Array.prototype.push.apply(enums, sourceFile.getEnums());
    }
    ////console.log("classes:"  + classes);
    for (let i in enums) {
      // //console.log("class name to be found=" + className);
      // //console.log("class[" + i + "]=" + classes[i]);

      if (enums[i].getName().indexOf(enumName) >= 0) {
        // //console.log("class name found!=" + className);
        //console.log("enum=="+enums[i].getText());
        return enums[i];
      }
    }
    // //console.log("class name not found :((( =" + className);
    return null;
  }

  export function getInterface(pathPattern: string, interfaceName: string): InterfaceDeclaration {
    let interfaces: InterfaceDeclaration[] = [];
    const project = new Project({});
    project.addExistingSourceFiles(pathPattern);
    let sourceFiles = project.getSourceFiles();
    ////console.log("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      ////console.log("classes:"  + sourceFile.getClasses());
      Array.prototype.push.apply(interfaces, sourceFile.getInterfaces());
    }
    ////console.log("classes:"  + classes);
    for (let i in interfaces) {
      // //console.log("class name to be found=" + className);
      // //console.log("class[" + i + "]=" + classes[i]);

      if (interfaces[i].getName().indexOf(interfaceName) >= 0) {
        // //console.log("class name found!=" + className);
        //console.log("enum=="+enums[i].getText());
        return interfaces[i];
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

  export function getPropertyExample(propertyType: string, pathPattern: string, alterNativePathPattern: string, originalType?:string) {

    if (propertyType == undefined || propertyType=='string') {
      return  'a_text';
    }
    else if (propertyType == 'number') {
      return  '123';
    }
    else if (propertyType == 'boolean') {
      return  true;
    }
    else if (propertyType.toString().indexOf("[") >= 0) {
      let returnExample = "[";
      returnExample +=
         ReflectionUtils.getPropertyExample(propertyType.toString().substring(0, propertyType.toString().indexOf("[")), pathPattern, alterNativePathPattern) + ", " +
         ReflectionUtils.getPropertyExample(propertyType.toString().substring(0, propertyType.toString().indexOf("[")), pathPattern, alterNativePathPattern)
      ;
      returnExample += "]";
      return returnExample;
    }
    else if (propertyType == 'enum') {
      let returnExample = "";
      let enumClass = getEnum(pathPattern, originalType);
      return enumClass.getMembers()[0].getText();
    }
    else {
      let classObj: {[k: string]: any} = {};
      classObj = ReflectionUtils.getClassParametersDescriptionFull(pathPattern, alterNativePathPattern, propertyType, {});
      if (classObj == {})  {
        return null;
      }

      // let classClass = getClass(pathPattern, propertyType);
      // console.log("pathPattern == " + pathPattern);
      // console.log("classClass==" + classClass);
      // if (classClass == null)  {
      //   classClass = getClass(alterNativePathPattern, propertyType);
      //   if (classClass == null)  {
      //     return null;
      //   }
      // }
      // let classClassStructure = classClass.getStructure();
      // let classProperties = classClassStructure.properties;

      let classProperties = classObj.classProperties;
      let returnExample = "{";
      if (classProperties != undefined) {
      for (let property of classProperties) {
          if (property.propName === 'type') {
            continue;
          }
          returnExample += '\n' + property.propName + ': ' +  ReflectionUtils.getPropertyExample(property.propType, pathPattern, alterNativePathPattern) + ',';
        }
        if (returnExample != "{") {
          returnExample = returnExample.slice(0, -1);
        }
      }
      returnExample += "}";
      return returnExample;
    }
  }

  export function getClassParametersDescriptionFull(pathPattern: string, alterNativePathPattern: string, className: string, classObj: {[k: string]: any}): {[k: string]: any} {

      let classClass =  getClass(pathPattern, className);
      let enumClass = null;
      let interfaceClass = null;
      let alernative = false;
      let isClassInterface = false;

      if (classClass == null)  {
        //console.log("class " + className + " not found trying alternative");
        classClass = getClass(alterNativePathPattern, className);
        if (classClass == null)  {
          //it may be an enum
          enumClass = getEnum(pathPattern, className);

          if (enumClass == null)  {
            enumClass = getEnum(alterNativePathPattern, className);

            if (enumClass == null)  {
              interfaceClass = getInterface(pathPattern, className);

              if (interfaceClass == null)  {
                interfaceClass = getInterface(alterNativePathPattern, className);

                if (interfaceClass == null)  {
                  return classObj;
                }
                else {
                  isClassInterface = true;
                }
              }
              else {
                isClassInterface = true;
              }
            }
            else {
              return classObj;
            }
          }
          else {
            return classObj;
          }
        }
      }

      let classClassStructure: ClassDeclarationStructure | InterfaceDeclarationStructure = {};

      if (!isClassInterface) {
        classClassStructure = classClass.getStructure();
      }
      else {
        //console.log("className " + className + " is an interface!" );
        classClassStructure = interfaceClass.getStructure();
      }

      let classProperties = classClassStructure.properties;

      //console.log("classObj.classProperties before=" + classObj.classProperties);

      if (classClassStructure.extends != undefined) {
        //console.log(classClassStructure.name + " extends " + classClassStructure.extends);
        let baseClassName = "";
        if (!(classClassStructure.extends instanceof Array)) {
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
            importDeclarations = ReflectionUtils.getClassImportDeclarations(alterNativePathPattern,  className);
          }
          else {
            importDeclarations = ReflectionUtils.getClassImportDeclarations(pathPattern,  className);
          }

          //console.log("invoked getClassImportDeclarations");

          for (let importDeclaration of importDeclarations) {
            if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
              let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
              let baseClassSource = join(process.cwd(), `.`) + `/node_modules/` + moduleSpecifier + "/**/*.ts*";
              if (alernative) {
                 getClassParametersDescriptionFull(baseClassSource, alterNativePathPattern, baseClassName, classObj);
              }
              else {
                 getClassParametersDescriptionFull(baseClassSource, pathPattern, baseClassName, classObj);
              }
            }
          }
        }
        else {
          for ( let baseClass of classClassStructure.extends) {
            if (classClassStructure.extends.indexOf("<") >= 0) {
              baseClassName = baseClass.substring(0, classClassStructure.extends.indexOf("<"));
            }
            else if (classClassStructure.extends.indexOf("[") >= 0) {
              baseClassName = baseClass.substring(0, classClassStructure.extends.indexOf("["));
            }
            else {
              baseClassName = baseClass;
            }
            let importDeclarations: ImportDeclaration[] = [];
            //console.log("invoking getClassImportDeclarations");
            if (alernative) {
              importDeclarations = ReflectionUtils.getClassImportDeclarations(alterNativePathPattern,  className);
            }
            else {
              importDeclarations = ReflectionUtils.getClassImportDeclarations(pathPattern,  className);
            }

            //console.log("invoked getClassImportDeclarations");

            for (let importDeclaration of importDeclarations) {
              if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
                let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
                let baseClassSource = join(process.cwd(), `.`) + `/node_modules/` + moduleSpecifier + "/**/*.ts*";
                if (alernative) {
                   getClassParametersDescriptionFull(baseClassSource, alterNativePathPattern, baseClassName, classObj);
                }
                else {
                   getClassParametersDescriptionFull(baseClassSource, pathPattern, baseClassName, classObj);
                }
              }
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
          classPropertyObj.propExample =  ReflectionUtils.getPropertyExample(classPropertyObj.propType, pathPattern, alterNativePathPattern);
        }
        else if (property.type.toString().indexOf("[") >= 0) {
          classPropertyObj.propType = 'array';
          classPropertyObj.propItemType = property.type.toString().substring(0, property.type.toString().indexOf("["));
          classPropertyObj.propExample = "[ " +
             ReflectionUtils.getPropertyExample(classPropertyObj.propItemType, pathPattern, alterNativePathPattern) + ", " +
             ReflectionUtils.getPropertyExample(classPropertyObj.propItemType, pathPattern, alterNativePathPattern) + " ]"
          ;
        }
        else {
          //console.log("tento se " + property.type.toString() + " è un enum in " + pathPattern);
          enumClass = getEnum(pathPattern, property.type.toString());

          if (enumClass == null)  {
            //console.log("tento path alternativo per "  + property.type.toString() + " in " + alterNativePathPattern);
            enumClass = getEnum(alterNativePathPattern, property.type.toString());
          }

          if (enumClass != null) {
            //console.log(property.type.toString() + " is an enum with values: " + enumClass.getMembers());
            classPropertyObj.propType = 'enum';
            classPropertyObj.originalType = property.type.toString();
            classPropertyObj.enumValues = enumClass.getMembers();
          }
          else {
            //console.log("trying interface for " + classPropertyObj.propName);
            interfaceClass = getInterface(pathPattern, property.type.toString());
            if (interfaceClass == null)  {
              interfaceClass = getInterface(alterNativePathPattern, property.type.toString());
            }
            if (interfaceClass != null) {
              classPropertyObj.propType = 'interface';
              classPropertyObj.interfaceProperties = interfaceClass.getStructure().properties;
              console.log(classPropertyObj.interfaceProperties);
            }
            else {
              classPropertyObj.propType = property.type.toString();
            }
          }
          classPropertyObj.propExample =  ReflectionUtils.getPropertyExample(classPropertyObj.propType,pathPattern, alterNativePathPattern, classPropertyObj.originalType);
        }


        if (classObj.classProperties == undefined) {
          classObj.classProperties = [];
        }
        classObj.classProperties.push(classPropertyObj);
        // modelPropertiesNames.push(property.getName());
      }


     return classObj;


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
