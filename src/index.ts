import { createRouter, RadixNodeData, RadixRouter } from "radix3";

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

type Handler = (context: Context) => Response | Promise<Response>;

type RouteNode = {
  handlers: Partial<Record<HTTPMethod | "all", Handler>>;
};

export class Kaya {
  router: RadixRouter<RouteNode>;
  routes: Record<string, RouteNode>;

  constructor() {
    this.router = createRouter();
    this.routes = {};
  }

  register(method: HTTPMethod, path: string, handler: Handler) {
    if (!this.routes[path]) {
      this.routes[path] = { handlers: {} };
      this.router.insert(path, this.routes[path]);
    }
    this.routes[path].handlers[method] = handler;
    return this;
  }

  get(path: string, handler: Handler) {
    return this.register("get", path, handler);
  }

  head(path: string, handler: Handler) {
    return this.register("head", path, handler);
  }

  post(path: string, handler: Handler) {
    return this.register("post", path, handler);
  }

  put(path: string, handler: Handler) {
    return this.register("put", path, handler);
  }

  delete(path: string, handler: Handler) {
    return this.register("delete", path, handler);
  }

  options(path: string, handler: Handler) {
    return this.register("options", path, handler);
  }

  patch(path: string, handler: Handler) {
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

class Context {
  req: Request;
  params: Record<string, any>;

  constructor(req: Request, params: Record<string, any>) {
    this.req = req;
    this.params = params;
  }
}
