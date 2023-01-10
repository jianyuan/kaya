import { Kaya } from "../src/index.js";

const app = new Kaya()
  .get("/", () => {
    return new Response("OK");
  })
  .get("/hello/:name", () => {
    return new Response("hello world!");
  });

console.log("Hello via Bun!");
app.printRoutes();

export default {
  port: 3001,
  fetch: app.fetch,
};
