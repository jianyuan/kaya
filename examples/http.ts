import { Kaya } from "../src/index.js";

const app = new Kaya()
  .get("/", () => {
    return new Response("OK");
  })
  .get("/hello/:name", (context) => {
    const { name = "world" } = context.params;
    return new Response(`Hello ${name}!`);
  });

console.log("Hello via Bun!");

export default {
  port: 3001,
  fetch: app.fetch,
};
