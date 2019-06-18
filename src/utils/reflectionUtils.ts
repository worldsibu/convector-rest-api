import { join, relative } from 'path';
import { Project, ImportDeclaration, ClassDeclaration, ClassDeclarationStructure, MethodDeclaration, EnumDeclaration, PropertyDeclarationStructure, InterfaceDeclaration, InterfaceDeclarationStructure, SourceFile } from "ts-simple-ast";
import { d } from './debug';

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
      ////d("sourceFiles: " + sourceFiles);
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
      ////d("sourceFiles: " + sourceFiles);
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
      ////d("sourceFiles: " + sourceFiles);
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
    //d("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      let sourceFileClasses = sourceFile.getClasses();
      for (let sourceFileClass of sourceFileClasses) {
        if (sourceFileClass.getName() == className) {
          Array.prototype.push.apply(imports, sourceFile.getImportDeclarations());
          //break;
        }
      }
    }
    //d("imports: " + imports);

    return imports;
  }

  export function getClass(pathPattern: string, className: string): ClassDeclaration {
    let classes: ClassDeclaration[] = [];
    const project = new Project({});
    project.addExistingSourceFiles(pathPattern);
    let sourceFiles = project.getSourceFiles();
    ////d("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      ////d("classes:"  + sourceFile.getClasses());
      Array.prototype.push.apply(classes, sourceFile.getClasses());
    }
    ////d("classes:"  + classes);
    for (let i in classes) {
      // //d("class name to be found=" + className);
      // //d("class[" + i + "]=" + classes[i]);

      if (classes[i].getName().indexOf(className) >= 0) {
        // //d("class name found!=" + className);
        return classes[i];
      }
    }
    // //d("class name not found :((( =" + className);
    return null;
  }

  export function getEnum(pathPattern: string, enumName: string): EnumDeclaration {
    let enums: EnumDeclaration[] = [];
    const project = new Project({});
    project.addExistingSourceFiles(pathPattern);
    let sourceFiles = project.getSourceFiles();
    ////d("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      ////d("classes:"  + sourceFile.getClasses());
      Array.prototype.push.apply(enums, sourceFile.getEnums());
    }
    ////d("classes:"  + classes);
    for (let i in enums) {
      // //d("class name to be found=" + className);
      // //d("class[" + i + "]=" + classes[i]);

      if (enums[i].getName().indexOf(enumName) >= 0) {
        // //d("class name found!=" + className);
        //d("enum=="+enums[i].getText());
        return enums[i];
      }
    }
    // //d("class name not found :((( =" + className);
    return null;
  }

  export function getInterface(pathPattern: string, interfaceName: string): InterfaceDeclaration {
    let interfaces: InterfaceDeclaration[] = [];
    const project = new Project({});
    project.addExistingSourceFiles(pathPattern);
    let sourceFiles = project.getSourceFiles();
    ////d("sourceFiles: " + sourceFiles);
    for (let sourceFile of sourceFiles) {
      ////d("classes:"  + sourceFile.getClasses());
      Array.prototype.push.apply(interfaces, sourceFile.getInterfaces());
    }
    ////d("classes:"  + classes);
    for (let i in interfaces) {
      // //d("class name to be found=" + className);
      // //d("class[" + i + "]=" + classes[i]);

      if (interfaces[i].getName().indexOf(interfaceName) >= 0) {
        // //d("class name found!=" + className);
        //d("enum=="+enums[i].getText());
        return interfaces[i];
      }
    }
    // //d("class name not found :((( =" + className);
    return null;
  }


  export function getClassFromSource(sourceFile: SourceFile, className: string): Promise<ClassDeclaration> {
    return new Promise(function (fulfilled, rejected) {
      let classes = sourceFile.getClasses();
      ////d("className:"  + className);
      ////d("classes:"  + classes);
      for (let i in classes) {
        ////d("classes[" + i + "] = " + classes[i].getName());
        if (classes[i].getName().indexOf(className) >= 0) {
          ////d("getClassFromSource found class " + className);
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
      ////d("sourceFiles: " + sourceFiles);
      for (let sourceFile of sourceFiles) {
        Array.prototype.push.apply(classes, sourceFile.getClasses());
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
      ////d("sourceFiles: " + sourceFiles);
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
      ////d("sourceFiles: " + sourceFiles);
      let sourceFile = sourceFiles[0];
      const classClass = sourceFile.getClassOrThrow(className);
      properties = classClass.getStructure().properties;
      ////d("className: " + className);
      for (let prop of properties) {
        ////d("prop name: " + prop.name);
        let propType;
        if (prop.type == undefined) {
          propType = 'string';
        }
        else {
          propType = prop.type;
        }
        ////d("prop type: " + propType);
      }

      fulfilled(properties);
    });
  }

  export function getPropertyExample(propertyType: string, pathPattern: string, originalType?: string) {

    if (propertyType == undefined || propertyType == 'string') {
      return 'a_text';
    }
    else if (propertyType == 'number') {
      return '123';
    }
    else if (propertyType == 'boolean') {
      return true;
    }
    else if (propertyType.toString().indexOf("[") >= 0) {
      let returnExample = "[";
      // d("invoking recursion with:" + propertyType.toString().substring(0, propertyType.toString().indexOf("[")));
      returnExample +=
        ReflectionUtils.getPropertyExample(propertyType.toString().substring(0, propertyType.toString().indexOf("[")), pathPattern) + ", " +
        ReflectionUtils.getPropertyExample(propertyType.toString().substring(0, propertyType.toString().indexOf("[")), pathPattern)
        ;
      returnExample += "]";
      // d("return example = " + returnExample);
      return returnExample;
    }
    else if (propertyType == 'enum') {
      let returnExample = "";
      let enumClass = getEnum(pathPattern, originalType);
      // return enumClass.getMembers()[0].getText();
      return 0;
    }
    else {
      let classObj: { [k: string]: any } = {};
      classObj = ReflectionUtils.getClassParametersDescriptionFull(pathPattern, propertyType, {});
      if (classObj == {}) {
        return null;
      }

      let classProperties = classObj.classProperties;
      let returnExample = "{";
      if (classProperties != undefined) {
        for (let property of classProperties) {
          if (property.propName === 'type') {
            continue;
          }
          //d("invoking recursion for  " + property.originalPropType+ " in " + pathPattern);
          returnExample += '\n' + property.propName + ': ' + ReflectionUtils.getPropertyExample(property.originalPropType, pathPattern) + ',';
          //d("getting example for " + property.originalPropType );
        }
        if (returnExample != "{") {
          returnExample = returnExample.slice(0, -1);
        }
      }
      returnExample += "}";
      // d("getting example for " + propertyType + " example:" + returnExample);
      return returnExample;
    }
  }

  export function getClassTypeAndPath(pathPattern: string, className: string): { [k: string]: any } {
    let returnObj: { [k: string]: any } = {};

    let classClass = getClass(pathPattern, className);

    let enumClass = null;
    let interfaceClass = null;

    let isClassInterface = false;
    let isEnum = false;
    let isClass = false;

    if (classClass == null || classClass == undefined) {
      enumClass = getEnum(pathPattern, className);
      if (enumClass == null || enumClass == undefined) {
        interfaceClass = getInterface(pathPattern, className);
        if (interfaceClass != null && interfaceClass != undefined) {
          //d(className + " is an interface");
          isClassInterface = true;
        }
        else {
          return undefined;
        }
      }
      else {
        //d(className + " is an interface");
        isEnum = true;
      }
    }
    else {
      isClass = true;
    }

    returnObj.pathPattern = pathPattern;
    returnObj.isClass = isClass;
    returnObj.isEnum = isEnum;
    returnObj.isClassInterface = isClassInterface;
    returnObj.classClass = classClass;
    returnObj.enumClass = enumClass;
    returnObj.interfaceClass = interfaceClass;

    return returnObj;
  }


  export function getClassParametersDescriptionFull(
    pathPattern: string, className: string, classObj:
      { [k: string]: any }): { [k: string]: any } {


    let inspectedClassObj: { [k: string]: any } = getClassTypeAndPath(pathPattern, className);
    let classClassStructure: ClassDeclarationStructure | InterfaceDeclarationStructure = {};

    if (inspectedClassObj == undefined) {
      return classObj;
    }

    if (!inspectedClassObj.isClassInterface) {
      classClassStructure = inspectedClassObj.classClass.getStructure();
    }
    else {
      //d("className " + className + " is an interface!" );
      classClassStructure = inspectedClassObj.interfaceClass.getStructure();
    }

    let classProperties = classClassStructure.properties;

    //d("classObj.classProperties before=" + classObj.classProperties);

    if (classClassStructure.extends != undefined) {
      //d(classClassStructure.name + " extends " + classClassStructure.extends);
      //d(className + " extends => " + classClassStructure.extends);
      let baseClassName = "";
      if (!(classClassStructure.extends instanceof Array)) {
        // d(classClassStructure.extends + " not an arrray");
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
        //d("invoking getClassImportDeclarations");

        // d("looking for :" + className + " in " + pathPattern);
        importDeclarations = ReflectionUtils.getClassImportDeclarations(pathPattern, className);

        //d("importDeclarations for " + className + " has length: " + importDeclarations.length);

        for (let importDeclaration of importDeclarations) {
          if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
            let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
            let baseClassSource = "";
            if (moduleSpecifier.startsWith(".")) {
              baseClassSource = pathPattern.substring(0, pathPattern.lastIndexOf("/") + 1) + moduleSpecifier.substring(moduleSpecifier.indexOf("/") + 1) + ".ts";
            }
            else if (moduleSpecifier.startsWith("/")) {
              baseClassSource = moduleSpecifier;
            }
            else {
              baseClassSource = join(process.cwd(), `.`) + `/node_modules/` + moduleSpecifier + "/**/*.ts*";
            }

            //d("moduleSpecifier: " + moduleSpecifier);
            // d("normal for " + className);
            // d(getClassTypeAndPath(pathPattern, className));
            // d("alternative for " + className);
            // d(getClassTypeAndPath(baseClassSource, className));

            if (getClassTypeAndPath(pathPattern, baseClassName) != undefined) {
              getClassParametersDescriptionFull(pathPattern, baseClassName, classObj);
            }
            else if (getClassTypeAndPath(baseClassSource, baseClassName) != undefined) {
              getClassParametersDescriptionFull(baseClassSource, baseClassName, classObj);
            }
            else {
              d(baseClassName + " non trovato nè in " + pathPattern + " nè in " + baseClassSource);
            }
            // d("looking for :" + baseClassName + " in " + pathPattern);


          }
        }
      }
      else {
        d(className + " is an interface that extends:");
        for (let baseClass of classClassStructure.extends) {
          d(" - " + baseClass);
          if (baseClass.indexOf("<") >= 0) {
            baseClassName = baseClass.substring(0, baseClass.indexOf("<"));
          }
          else if (baseClass.indexOf("[") >= 0) {
            baseClassName = baseClass.substring(0, baseClass.indexOf("["));
          }
          else {
            baseClassName = baseClass;
          }
          let importDeclarations: ImportDeclaration[] = [];
          //d("invoking getClassImportDeclarations");

          d("looking for :" + className + " in " + pathPattern);
          importDeclarations = ReflectionUtils.getClassImportDeclarations(pathPattern, className);

          //d("importDeclarations for " + className + " has length: " + importDeclarations.length);

          for (let importDeclaration of importDeclarations) {
            if (importDeclaration.getText().indexOf(baseClassName) >= 0) {
              let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
              let baseClassSource = "";
              if (moduleSpecifier.startsWith(".")) {
                baseClassSource = pathPattern.substring(0, pathPattern.lastIndexOf("/") + 1) + moduleSpecifier.substring(moduleSpecifier.indexOf("/") + 1) + ".ts";
              }
              else if (moduleSpecifier.startsWith("/")) {
                baseClassSource = moduleSpecifier;
              }
              else {
                baseClassSource = join(process.cwd(), `.`) + `/node_modules/` + moduleSpecifier + "/**/*.ts*";
              }

              //d("moduleSpecifier: " + moduleSpecifier);
              // d("normal for " + className);
              // d(getClassTypeAndPath(pathPattern, className));
              // d("alternative for " + className);
              // d(getClassTypeAndPath(baseClassSource, className));

              if (getClassTypeAndPath(pathPattern, baseClassName) != undefined) {
                d(baseClassName + " found in " + pathPattern);
                getClassParametersDescriptionFull(pathPattern, baseClassName, classObj);
              }
              else if (getClassTypeAndPath(baseClassSource, baseClassName) != undefined) {
                d(baseClassName + " found in " + baseClassSource);
                getClassParametersDescriptionFull(baseClassSource, baseClassName, classObj);
              }
              else {
                d(baseClassName + " non trovato nè in " + pathPattern + " nè in " + baseClassSource);
              }
              // d("looking for :" + baseClassName + " in " + pathPattern);


            }
          }
        }
      }
    }

    for (let property of classProperties) {

      let pathPatternForExample = pathPattern;
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

      let classPropertyObj: { [k: string]: any } = {};
      classPropertyObj.propName = property.name;

      if (property.type == undefined) {
        classPropertyObj.propType = 'string';
        classPropertyObj.propExample = ReflectionUtils.getPropertyExample(classPropertyObj.propType, pathPattern);
      }
      else if (property.type.toString().indexOf("[") >= 0) {
        classPropertyObj.propType = 'array';
        classPropertyObj.originalPropType = property.type.toString();
        classPropertyObj.propItemType = property.type.toString().substring(0, property.type.toString().indexOf("["));
        // d("invoking getPropertyExample for " + classPropertyObj.originalPropType);

        classPropertyObj.propExample = ReflectionUtils.getPropertyExample(classPropertyObj.originalPropType, pathPattern);
      }
      else {
        //d("tento se " + property.type.toString() + " è un enum in " + pathPattern);
        let enumClass = getEnum(pathPattern, property.type.toString());

        if (enumClass != null) {
          //d(property.type.toString() + " is an enum with values: " + enumClass.getMembers());
          classPropertyObj.propType = 'enum';
          classPropertyObj.originalType = property.type.toString();
          classPropertyObj.enumValues = enumClass.getMembers();
        }
        else {
          let inspectedClassObj: { [k: string]: any } = getClassTypeAndPath(pathPattern, className);

          if (inspectedClassObj.interfaceClass != null) {
            classPropertyObj.propType = 'interface';
            classPropertyObj.interfaceProperties = inspectedClassObj.interfaceClass.getStructure().properties;
            //d(classPropertyObj.interfaceProperties);
          }
          else {
            classPropertyObj.propType = property.type.toString();
            if (ReflectionUtils.getClassTypeAndPath(pathPattern, classPropertyObj.propType) == undefined) {
              // d("non trovo " + classPropertyObj.propType + " in " + pathPattern);
              let importDeclarations = ReflectionUtils.getClassImportDeclarations(pathPattern, className);

              for (let importDeclaration of importDeclarations) {
                //d("cerco " + classPropertyObj.propType + " in " + importDeclaration.getText());
                if (importDeclaration.getText().indexOf(classPropertyObj.propType) >= 0) {
                  let moduleSpecifier = importDeclaration.getModuleSpecifierValue();
                  //d("trovato " + classPropertyObj.propType + " in " + moduleSpecifier);
                  let baseClassSource = join(process.cwd(), `.`) + `/node_modules/` + moduleSpecifier + "/**/*.ts*";
                  let classObject = getClassTypeAndPath(baseClassSource, classPropertyObj.propType);

                  if (classObject != undefined) {
                    //d("trovato " + classPropertyObj.propType + " in " + classObject.pathPattern);
                    pathPatternForExample = classObject.pathPattern;
                    break;
                  }

                }
              }
            }
          }
        }
        classPropertyObj.propExample = ReflectionUtils.getPropertyExample(classPropertyObj.propType, pathPatternForExample, classPropertyObj.originalType);
      }


      if (classObj.classProperties == undefined) {
        classObj.classProperties = [];
      }
      classObj.classProperties.push(classPropertyObj);
      // modelPropertiesNames.push(property.getName());
    }


    return classObj;


  }

  function removeDuplicates(arr) {
    let unique_array = [];
    let unique_names_array = [];

    for (let i = 0; i < arr.length; i++) {
      if (unique_names_array.indexOf(arr[i].name) == -1) {
        unique_names_array.push(arr[i].name);
        unique_array.push(arr[i]);
      }
    }
    return unique_array
  }

}
