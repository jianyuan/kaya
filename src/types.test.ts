import type { ParamKey, PathParams } from "./types.js";

export type Expect<T extends true> = T;

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;
export type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;

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
