const pipe = (...functions: Function[]) => (arg) =>
  functions.reduce((accum, func) => func(accum), arg);

export default pipe;
