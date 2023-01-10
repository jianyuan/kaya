import Router, {
  type HTTPMethod,
  type Handler as FMWHandler,
} from "find-my-way";

type Handler = (request: Request) => Response | Promise<Response>;

export class Kaya {
  #router = Router();
  constructor() {}

  get(path: string, handler: Handler) {
    this.#router.get(path, handler as FMWHandler<any>);
    return this;
  }

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

    return (result.handler as unknown as Handler)(request);
  };

  printRoutes() {
    console.log(this.#router.prettyPrint());
  }
}
