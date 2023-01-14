import { z } from "zod";
import { Kaya } from "../src/index.js";

const app = new Kaya()
  .get("/", () => {
    return new Response("OK");
  })
  .get(
    "/hello/:name",
    {
      querySchema: z.object({
        name: z.string(),
      }),
    },
    (context) => {
      return new Response(`Hello ${context.params.name}!`);
    }
  );

console.log("Hello via Bun!");

export default {
  port: 3001,
  fetch: app.fetch,
};
