export const to = (promise: Promise<any>) =>
  promise.then(data => [null, data])
         .catch(err => [err]);

export const isObject = (obj: any) => obj === Object(obj);
