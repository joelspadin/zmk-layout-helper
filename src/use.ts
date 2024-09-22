export interface PromiseWrapper<T> {
  read: () => T;
}

export function wrapPromise<T>(promise: Promise<T>): { read: () => T } {
  let status: "pending" | "success" | "error" = "pending";
  let response: T;
  let error: unknown;

  const suspender = promise.then(
    (res) => {
      status = "success";
      response = res;
    },
    (err) => {
      status = "error";
      error = err;
    }
  );

  const read = () => {
    if (status === "pending") {
      throw suspender;
    }

    if (status === "error") {
      throw error;
    }

    return response;
  };

  return { read };
}

// TODO: replace with react.use() once React 19 is released.
export function use<T>(promise: PromiseWrapper<T>): T {
  return promise.read();
}
