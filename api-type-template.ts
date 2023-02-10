import fs from 'fs';
import util from 'util';
import prettier from 'prettier';

const write = util.promisify(fs.writeFile);

function createSagaQueryApi() {
  const methods = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
    'connect',
    'trace',
  ];

  const uriTmpl = (method: string) => `
${method}(req: { saga?: any }): CreateAction<Ctx>;
${method}<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
${method}(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
${method}<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
${method}(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
${method}<P>(
  req: { saga?: any },
  fn: MiddlewareCo<Ctx>,
): CreateActionWithPayload<Ctx, P>;`;
  const uriMethods = methods.map((m) => uriTmpl(m)).join('\n');

  const methodTmpl = (
    method: string,
  ) => `${method}(name: ApiName): CreateAction<Ctx>;
${method}<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
${method}(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
${method}<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
${method}(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
${method}<P>(name: ApiName, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
${method}(
  name: ApiName,
  req: { saga?: any },
  fn: MiddlewareCo<Ctx>,
): CreateAction<Ctx>;
${method}<P>(
  name: ApiName,
  req: { saga?: any },
  fn: MiddlewareCo<Ctx>,
): CreateActionWithPayload<Ctx, P>;`;
  const regMethods = methods.map((m) => methodTmpl(m)).join('\n');

  const tmpl = `/**
* This is an auto-generated file, do not edit directly!
* Run "yarn template" to generate this file.
*/
import type { SagaIterator } from "redux-saga";
import type { SagaApi } from "./pipe";
import type { ApiCtx, CreateAction, CreateActionWithPayload, MiddlewareCo, Next } from "./types";

export type ApiName = string | string[];

export interface SagaQueryApi<Ctx extends ApiCtx = ApiCtx> extends SagaApi<Ctx> {
  request: (
    r: Partial<RequestInit>,
  ) => (ctx: Ctx, next: Next) => SagaIterator<any>;
  cache: () => (ctx: Ctx, next: Next) => SagaIterator<any>;

  uri: (uri: string) => {
    ${uriMethods}
  }

${regMethods}
}`;

  return tmpl;
}

async function createTemplateFile(tmpl: string) {
  await write(
    './src/api-types.ts',
    prettier.format(tmpl, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
      arrowParens: 'always',
    }),
  );
}

createTemplateFile(createSagaQueryApi()).then(console.log).catch(console.error);
