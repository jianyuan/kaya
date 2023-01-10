import { z } from "zod";
import { Kaya } from "../src/index.js";

const app = new Kaya()
  .get("/", (ctx) => ctx.text("Hello world!"))
  .get(
    "/hello",
    {
      querySchema: z.object({
        name: z.string().default("world"),
      }),
    },
    (ctx) => ctx.text(`Hello ${ctx.query.name}!`)
  );

console.log("Hello via Bun!");
app.printRoutes();

export default {
  port: 3001,
  fetch: app.fetch,
};
