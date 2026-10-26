/**
 * Source location (`path:line:col`) of the user code that registered an injector or element,
 * shown in `toString()` and error messages.
 *
 * Stack frame 0 is the `Error` line, 1 is this function, 2 is the library function that called
 * it, so frame `index + 3` is that function's caller. Pass a larger `index` when the call goes
 * through more library frames (e.g. the factory or a stack constructor).
 */
export const getCaller = (index: number = 0) => {
  const callerString = new Error().stack!.split('\n')[index + 3].trim();
  return callerString.slice(callerString.indexOf('(') + 1, -1);
};
