import { createRouter, RadixNodeData, RadixRouter } from "radix3";
import { Equal, Expect } from "./types.test.js";

const HTTPMethods = [
  "get",
  "head",
  "post",
  "put",
  "delete",
  "options",
  "patch",
] as const;
type HTTPMethod = (typeof HTTPMethods)[number];

type Handler<P extends string = string> = (
  context: Context<P>
) => Response | Promise<Response>;

type RouteNode = {
  handlers: Partial<Record<HTTPMethod | "all", Handler<any>>>;
};

export class Kaya {
  router: RadixRouter<RouteNode>;
  routes: Record<string, RouteNode>;

  constructor() {
    this.router = createRouter();
    this.routes = {};
  }

  register<P extends string>(
    method: HTTPMethod | "all",
    path: P,
    handler: Handler<P>
  ) {
    if (!this.routes[path]) {
      this.routes[path] = { handlers: {} };
      this.router.insert(path, this.routes[path]);
    }
    this.routes[path].handlers[method] = handler;
    return this;
  }

  get<P extends string>(path: P, handler: Handler<P>) {
    return this.register("get", path, handler);
  }

  head<P extends string>(path: P, handler: Handler<P>) {
    return this.register("head", path, handler);
  }

  post<P extends string>(path: P, handler: Handler<P>) {
    return this.register("post", path, handler);
  }

  put<P extends string>(path: P, handler: Handler<P>) {
    return this.register("put", path, handler);
  }

  delete<P extends string>(path: P, handler: Handler<P>) {
    return this.register("delete", path, handler);
  }

  options<P extends string>(path: P, handler: Handler<P>) {
    return this.register("options", path, handler);
  }

  patch<P extends string>(path: P, handler: Handler<P>) {
    return this.register("patch", path, handler);
  }

  fetch = (req: Request) => {
    const path = getPath(req.url);
    const method = req.method.toLowerCase() as HTTPMethod;

    const match = this.router.lookup(path);
    if (!match) {
      return new Response("404 Not Found", { status: 404 });
    }

    const handler = match.handlers[method] || match.handlers.all;
    if (!handler) {
      return new Response("405 Method Not Allowed", { status: 405 });
    }

    const params = match.params || {};

    const context = new Context(req, params);
    return handler(context);
  };
}

function getPath(url: string) {
  const queryIndex = url.indexOf("?");
  const result = url.substring(
    url.indexOf("/", 8), // 8 because the shortest possible URL is 8 characters: "x://x.x/".length === 8
    queryIndex === -1 ? url.length : queryIndex
  );
  return result;
}

class Context<P extends string = string> {
  req: Request;
  params: PathParams<P>;

  constructor(req: Request, params: PathParams<P>) {
    this.req = req;
    this.params = params;
  }
}

type ParamKey<
  P extends string,
  I extends never[] = []
> = P extends `**:${infer Param}`
  ? Param
  : P extends `**${string}`
  ? "_"
  : P extends `*${string}`
  ? `_${I["length"]}`
  : P extends `:${infer Param}`
  ? Param
  : never;

type ParamKeys<
  P extends string,
  I extends never[] = []
> = P extends `${infer Head}/${infer Tail}`
  ? Head extends "*"
    ? ParamKey<Head, I> | ParamKeys<Tail, [...I, never]>
    : ParamKey<Head, I> | ParamKeys<Tail, I>
  : ParamKey<P, I>;

type PathParams<P extends string> = Record<ParamKeys<P>, string>;

type paramKeyCases = [
  Expect<Equal<ParamKey<"never">, never>>,
  Expect<Equal<ParamKey<":name">, "name">>,
  Expect<Equal<ParamKey<"**">, "_">>,
  Expect<Equal<ParamKey<"**:name">, "name">>,
  Expect<Equal<ParamKey<"*">, "_0">>,
  Expect<Equal<ParamKey<"*", [never]>, "_1">>,
  Expect<Equal<ParamKey<"*", [never, never]>, "_2">>
];

type pathParamsCases = [
  Expect<Equal<PathParams<"/a">, {}>>,
  Expect<Equal<PathParams<"/a/:name">, { name: string }>>,
  Expect<Equal<PathParams<"/a/**">, { _: string }>>,
  Expect<Equal<PathParams<"/a/**:name">, { name: string }>>,
  Expect<Equal<PathParams<"/a/*">, { _0: string }>>,
  Expect<Equal<PathParams<"/a/*/b/*">, { _0: string; _1: string }>>,
  Expect<
    Equal<
      PathParams<"/a/:name/b/*/c/*">,
      { _0: string; _1: string; name: string }
    >
  >,
  Expect<
    Equal<
      PathParams<"/a/*/b/*/c/:name">,
      { _0: string; _1: string; name: string }
    >
  >,
  Expect<Equal<PathParams<"/a/*/b/**">, { _0: string; _: string }>>,
  Expect<Equal<PathParams<"/a/*/b/**:name">, { _0: string; name: string }>>
];
