import ts from 'typescript'
import { z } from "zod";
import { Environment, ResultType } from './client-sdk-lib/types'
import fs from 'fs';
import path from 'path';
import { Deprecated, Replaced, Route, Routes } from './router';

export type Config = {
  [key in Environment]: {
    url: string
  }
}

export const generateClientSdk = <ContractTypes extends Record<string, z.AnyZodObject>>(routes: Routes<ContractTypes>, contractsSourceFile: string, config: Config, outPath: string): void => {
  const sourceCode = `
    // Generated code, do not modify

    ${generateImports(contractsSourceFile, routes)}

    ${generateFunctionIOTypes(routes)}

    ${generateS2sSdkClass(config, routes)}
  `

  saveSdk(outPath, formatSourceCode(sourceCode), contractsSourceFile)
}

const generateImports = <ContractTypes extends Record<string, z.AnyZodObject>>(contractsPath: string, routes: Routes<ContractTypes>): string => {
  const allReturnTypes = routes
    .flatMap((route: Route<ContractTypes>): ResultType[] => route.resultTypes)

  const withoutDuplicates = [...new Set(allReturnTypes)]

  return `
    import { z } from 'zod'
    import { invokeRoute } from './client';
    import { createHttpClient, HeaderGetter } from './http-client';
    import { Environment, HttpClient, ${withoutDuplicates.join(', ')} } from './types';
    import contracts from './${removeFileExtension(getFilename(contractsPath))}';
  `
}

const generateS2sSdkClass = <ContractTypes extends Record<string, z.AnyZodObject>>(config: Config, routes: Routes<ContractTypes>): string => {
  return `
    export class Sdk {
      private client: HttpClient;

      constructor(environment: Environment, audiance: string, s2sSecretArn: string) {
        this.client = createHttpClient(
          environment === 'Dev' ? '${config['Dev'].url}' : '${config['Prod'].url}',
          audiance,
          s2sSecretArn
        );
      }

      ${generateClassFunctions(routes)}
    }
  `
}

const formatSourceCode = (sourceCode: string): string => {
  const sourceFile = ts.createSourceFile('client-sdk.ts', sourceCode, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  
  return printer.printFile(sourceFile);
}

const saveSdk = (outPath: string, sourceCode: string, contractsSourceFile: string): void => {
  if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { recursive: true });
  }

  fs.mkdirSync(outPath, { recursive: true });
  fs.writeFileSync(path.join(outPath, 'index.ts'), sourceCode);

  copyImportFile('client.ts', outPath);
  copyImportFile('http-client.ts', outPath);
  copyImportFile('types.ts', outPath);
  
  fs.copyFileSync(contractsSourceFile, path.join(outPath, getFilename(contractsSourceFile)));
}

const copyImportFile = (importFile: string, outPath: string): void => {
  fs.copyFileSync(path.join(__dirname, 'client-sdk-lib', importFile), path.join(outPath, importFile));
}

const generateClassFunctions = <ContractTypes extends Record<string, z.AnyZodObject>>(routes: Routes<ContractTypes>): string => {
  return routes.reduce((classFunctionsCode: string, route: Route<ContractTypes>): string => {
    return `
      ${classFunctionsCode}

      ${generateClassFunction(route.name, route)}
    `
  }, '')
}

const generateFunctionIOTypes = <ContractTypes extends Record<string, z.AnyZodObject>>(routes: Routes<ContractTypes>): string => {
  return routes.reduce((code: string, route: Route<ContractTypes>): string => {
    const definedTypes: string = `
      ${code}
      type ${getInputTypeName(route.name)} = z.infer<typeof contracts.${route.inputSchema.toString()}>;
    `

    if (route.outputSchema) {
      return `
        ${definedTypes}
        type ${getOutputTypeName(route.name)} = z.infer<typeof contracts.${route.outputSchema.toString()}>;
      `
    }
    
    return definedTypes
  }, '')
}

const generateClassFunction = <ContractTypes extends Record<string, z.AnyZodObject>>(name: string, route: Route<ContractTypes>): string => {  
  return `
    /**
    * ${route.summary}
    * ${route.deprecated ? `@deprecated ${hasReplacement(route.deprecated) ? `the method ${route.deprecated?.replacement} should be used instead` : 'this method should not be used'}` : ''}
    */
    public ${uncapitalize(name)}(input: ${getInputTypeName(name)}): Promise<${constructReturnType(name, route)}> {
      const result = invokeRoute(this.client, '${route.path}', '${route.method}', input, contracts.${route.inputSchema.toString()})

      return result as Promise<${constructReturnType(name, route)}>;
    }
  `;
}

const hasReplacement = (deprecated: Deprecated): deprecated is Replaced => {
  return (deprecated as Replaced).replacement !== undefined
}

const constructReturnType = <ContractTypes extends Record<string, z.AnyZodObject>>(routeName: string, route: Route<ContractTypes>) => {
  return route.resultTypes.map((resultType: ResultType): string => {
    if (resultType === 'Success') {
      return `Success<${getOutputTypeName(routeName)}>`
    }
    return `${resultType}`;
  }).join(' | ')
}

const getInputTypeName = (name: string): string => capitalize(name.concat('Input'))
const getOutputTypeName = (name: string): string => capitalize(name.concat('Output'))

const capitalize = (word: string): string => word
  .charAt(0)
  .toUpperCase()
  .concat(word.slice(1))

const uncapitalize = (word: string): string => word
  .charAt(0)
  .toLowerCase()
  .concat(word.slice(1))

const getFilename = (fullPath: string): string => {
  return fullPath.replace(/^.*[\\/]/, '')
}

const removeFileExtension = (filename: string): string => {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}