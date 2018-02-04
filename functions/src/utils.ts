export const to = (promise: Promise<any>): Promise<Array<any>> =>
  promise.then(data => [null, data])
         .catch(err => [err]);

export const isObject = (obj): boolean => obj === Object(obj);
