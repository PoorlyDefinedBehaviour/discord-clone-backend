export default (...functions: Array<any>): any => (arg: any) =>
  functions.reduce((accum: any, func: any): any => func(accum), arg);
