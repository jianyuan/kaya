import Router, {
  type HTTPMethod,
  type Handler as FMWHandler,
} from "find-my-way";
import { ZodTypeAny } from "zod";

export type Parser = ZodTypeAny;

export class Context {
  request: Request;
  query?: Record<string, any>;

  constructor(request: Request, { query }: { query?: Record<string, any> }) {
    this.request = request;
    this.query = query;
  }

  text(text: string, options?: ResponseInit) {
    return new Response(text, options);
  }
}

type InternalHandler = (
  request: Request,
  params: Record<string, string | undefined>,
  searchParams: Record<string, string | string[]>
) => Response | Promise<Response>;
type Handler = (context: Context) => Response | Promise<Response>;
type RouteOptions = {
  querySchema?: Parser;
};

type RouteMethod =
  | ((path: string, options: RouteOptions, handler: Handler) => Kaya)
  | ((path: string, handler: Handler) => Kaya);

export class Kaya {
  #router = Router();
  constructor() {}

  get: RouteMethod = (
    path: string,
    options: RouteOptions | Handler,
    handler?: Handler
  ) => {
    if (handler === undefined) {
      handler = options as Handler;
      options = {};
    }

    if (handler === undefined) {
      throw new Error("undefined handler");
    }

    const internalHandler: InternalHandler = (
      request,
      params,
      searchParams
    ) => {
      console.log("params", params);
      console.log("searchParams", searchParams);

      const opts = options as RouteOptions;
      let query;
      if (opts?.querySchema) {
        query = opts.querySchema.parse(searchParams);
      }
      const context = new Context(request, { query });
      return (handler as Handler)(context);
    };
    this.#router.get(path, internalHandler as FMWHandler<any>);
    return this;
  };

  notFoundHandler() {
    return new Response("404 Not Found", { status: 404 });
  }

  fetch = (request: Request) => {
    const method = request.method.toUpperCase() as HTTPMethod;
    const url = request.url;

    const result = this.#router.find(method, url);
    if (!result) {
      return this.notFoundHandler();
    }

    return (result.handler as unknown as InternalHandler)(
      request,
      result.params,
      result.searchParams
    );
  };

  printRoutes() {
    console.log(this.#router.prettyPrint());
  }
}
