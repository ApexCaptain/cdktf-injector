import * as path from 'path';

/**
 * Root of this library's own code (`src/` when run from source, `lib/` when published),
 * with a trailing separator so `src-other/` does not match.
 */
const libraryRoot = path.join(path.resolve(__dirname, '..', '..', '..'), '/');

/**
 * Source location (`path:line:col`) of the user code that registered an injector or element,
 * shown in `toString()` and error messages.
 *
 * Skips every stack frame inside this library, so the result does not depend on how many
 * library functions the call went through (factory, stack wrapper, lazy element, ...).
 * `index` skips that many further frames past the first one outside the library.
 * Returns `'<unknown>'` when no such frame is in the captured trace.
 */
export const getCaller = (index: number = 0) => {
  const frames = (new Error().stack ?? '')
    .split('\n')
    .slice(1)
    .map((eachLine) => eachLine.trim())
    .map((eachLine) =>
      eachLine.endsWith(')')
        ? eachLine.slice(eachLine.lastIndexOf('(') + 1, -1)
        : eachLine.replace(/^at\s+/, ''),
    );
  const firstExternal = frames.findIndex(
    (eachFrame) => !eachFrame.startsWith(libraryRoot),
  );
  if (firstExternal < 0) return '<unknown>';
  return frames[firstExternal + index] ?? '<unknown>';
};
