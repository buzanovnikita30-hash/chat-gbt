export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guarded = promise.then(
    (value) => value,
    (error) => {
      throw error;
    }
  );
  void promise.catch(() => undefined);

  try {
    return await Promise.race([
      guarded,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
