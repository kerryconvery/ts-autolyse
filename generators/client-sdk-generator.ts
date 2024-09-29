import ts from 'typescript'
import { z } from "zod";
import { RouterConfig, Route, ReasonType, Environment } from "./types";
import fs from 'fs';
import path from 'path';

export type Config = {
  [key in Environment]: {
    url: string
  }
}

export const generateClientSdk = <ContractTypes extends Record<string, z.ZodType>>(routeDefinition: RouterConfig<ContractTypes>, contractsSourceFile: string, config: Config, outPath: string): void => {
  const sourceCode = `
    // Generated code, do not modify

    ${generateImports(contractsSourceFile, routeDefinition)}

    ${generateFunctionIOTypes(routeDefinition)}

    ${generateSdkClass(config, routeDefinition)}
  `

  saveSdk(outPath, formatSourceCode(sourceCode), contractsSourceFile)
}

const generateImports = <ContractTypes extends Record<string, z.ZodType>>(contractsPath: string, routeDefinition: RouterConfig<ContractTypes>): string => {
  const allReturnTypes = Object
    .values(routeDefinition)
    .flatMap((route: Route<ContractTypes>): ReasonType[] => route.resultTypes)

  const withoutDuplicates = [...new Set(allReturnTypes)]

  return `
    import { z } from 'zod'
    import { invokeRoute } from './client';
    import { createHttpClient, HeaderGetter } from './httpClient';
    import { Environment, HttpClient, ${withoutDuplicates.join(', ')} } from './types';
    import * as contracts from './${removeFileExtension(getFilename(contractsPath))}';
  `
}

const generateSdkClass = <ContractTypes extends Record<string, z.ZodType>>(config: Config, routeDefinition: RouterConfig<ContractTypes>): string => {
  return `
    export class Sdk {
      private client: HttpClient;

      constructor(environment: Environment, getCustomHeaders: HeaderGetter) {
        this.client = createHttpClient(
          environment === 'Dev' ? '${config['Dev'].url}' : '${config['Prod'].url}',
          getCustomHeaders
        );
      }

      ${generateClassFunctions(routeDefinition)}
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

  copyImportFile('client.ts', __dirname, outPath);
  copyImportFile('httpClient.ts', __dirname, outPath);
  copyImportFile('types.ts', __dirname, outPath);
  
  fs.copyFileSync(contractsSourceFile, path.join(outPath, getFilename(contractsSourceFile)));
}

const copyImportFile = (importFile: string, importPath: string, outPath: string): void => {
  fs.copyFileSync(path.join(importPath, importFile), path.join(outPath, importFile));
}

const generateClassFunctions = <ContractTypes extends Record<string, z.ZodType>>(routeDefinition: RouterConfig<ContractTypes>): string => {
  return Object.entries(routeDefinition).reduce((classFunctionsCode: string, [name, route]: [string, Route<ContractTypes>]): string => {
    return `
      ${classFunctionsCode}

      ${generateClassFunction(name, route)}
    `
  }, '')
}

const generateFunctionIOTypes = <ContractTypes extends Record<string, z.ZodType>>(routeDefinition: RouterConfig<ContractTypes>): string => {
  return Object.entries(routeDefinition).reduce((code: string, [name, route]: [string, Route<ContractTypes>]): string => {
    return `
      ${code}
      type ${getInputTypeName(name)} = z.infer<typeof contracts.${route.inputSchema.toString()}>
      type ${getOutputTypeName(name)} = z.infer<typeof contracts.${route.outputSchema.toString()}>
    `
  }, '')
}

const generateClassFunction = <ContractTypes extends Record<string, z.ZodType>>(name: string, route: Route<ContractTypes>): string => {  
  return `
    /**
    * ${route.summary}
    * ${route.deprecated ? `@deprecated ${route.deprecated?.replacement ? `the method ${route.deprecated?.replacement} should be used instead` : 'this method should not be used'}` : ''}
    */
    public ${uncapitalize(name)}(input: ${getInputTypeName(name)}): Promise<${constructReturnType(name, route)}> {
      const result = invokeRoute(this.client, '${route.path}', '${route.method}', input, contracts.${route.inputSchema.toString()})

      return result as Promise<${constructReturnType(name, route)}>;
    }
  `;
}

const constructReturnType = <ContractTypes extends Record<string, z.ZodType>>(routeName: string, route: Route<ContractTypes>) => {
  return route.resultTypes.map((resultType: ReasonType): string => {
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