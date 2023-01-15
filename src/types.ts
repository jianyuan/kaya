export type ParamKey<
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

export type ParamKeys<
  P extends string,
  I extends never[] = []
> = P extends `${infer Head}/${infer Tail}`
  ? Head extends "*"
    ? ParamKey<Head, I> | ParamKeys<Tail, [...I, never]>
    : ParamKey<Head, I> | ParamKeys<Tail, I>
  : ParamKey<P, I>;

export type PathParams<P extends string> = Record<ParamKeys<P>, string>;
