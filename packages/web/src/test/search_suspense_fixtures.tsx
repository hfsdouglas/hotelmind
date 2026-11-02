export function create_deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolve_promise, reject_promise) => {
    resolve = resolve_promise
    reject = reject_promise
  })

  return { promise, resolve, reject }
}
