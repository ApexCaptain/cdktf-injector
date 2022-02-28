export const getCaller = (index: number = 0) => {
  const callerString = new Error().stack!.split('\n')[index + 3].trim();
  return callerString.slice(callerString.indexOf('(') + 1, -1);
};
