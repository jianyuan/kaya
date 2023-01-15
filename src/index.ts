import type { RadixRouter } from "radix3";
import { createRouter } from "radix3";
import type { z } from "zod";
import type { PathParams } from "./types.js";

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

type HandlerOptions<P extends string = string> = {
  querySchema?: z.ZodObject<Record<keyof PathParams<P>, any>>;
};

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

  buildHandler<P extends string>(
    handler: Handler<P>,
    options?: HandlerOptions<P>
  ): Handler<P> {
    return (context) => {
      if (options?.querySchema) {
        // TODO: Safe parse
        console.log(context.params);
        context.params = options.querySchema.parse(context.params);
      }
      return handler(context);
    };
  }

  register<P extends string>(
    method: HTTPMethod | "all",
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    if (!this.routes[path]) {
      this.routes[path] = { handlers: {} };
      this.router.insert(path, this.routes[path]);
    }

    if (handler === undefined) {
      this.routes[path].handlers[method] = this.buildHandler(
        handlerOrOptions as Handler<P>
      );
    } else {
      this.routes[path].handlers[method] = this.buildHandler(
        handler,
        handlerOrOptions as HandlerOptions<P>
      );
    }
    return this;
  }

  get<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  get<P extends string>(path: P, handler: Handler<P>): this;
  get<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("get", path, handlerOrOptions, handler);
  }

  head<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  head<P extends string>(path: P, handler: Handler<P>): this;
  head<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("head", path, handlerOrOptions, handler);
  }

  post<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  post<P extends string>(path: P, handler: Handler<P>): this;
  post<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("post", path, handlerOrOptions, handler);
  }

  put<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  put<P extends string>(path: P, handler: Handler<P>): this;
  put<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("put", path, handlerOrOptions, handler);
  }

  delete<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  delete<P extends string>(path: P, handler: Handler<P>): this;
  delete<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("delete", path, handlerOrOptions, handler);
  }

  options<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  options<P extends string>(path: P, handler: Handler<P>): this;
  options<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("options", path, handlerOrOptions, handler);
  }

  patch<P extends string>(
    path: P,
    options: HandlerOptions<P>,
    handler: Handler<P>
  ): this;
  patch<P extends string>(path: P, handler: Handler<P>): this;
  patch<P extends string>(
    path: P,
    handlerOrOptions: Handler<P> | HandlerOptions<P>,
    handler?: Handler<P>
  ) {
    return this.register("patch", path, handlerOrOptions, handler);
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

  json(value: any) {
    return new Response(JSON.stringify(value));
  }

  text(value: string) {
    return new Response(value);
  }
}
