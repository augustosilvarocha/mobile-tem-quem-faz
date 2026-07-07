type CacheOptions = {
  ttlMs?: number;
};

function isFresh(cachedAt: number, ttlMs?: number) {
  if (ttlMs === undefined) {
    return true;
  }

  return Date.now() - cachedAt < ttlMs;
}

export function createMemoryCache<T>() {
  let cachedData: T | null = null;
  let cachedAt = 0;
  let cacheVersion = 0;
  let pendingRequest: Promise<T> | null = null;

  function getCached(options: CacheOptions = {}) {
    if (cachedData === null || !isFresh(cachedAt, options.ttlMs)) {
      return null;
    }

    return cachedData;
  }

  async function get(
    loadData: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = getCached(options);

    if (cached !== null) {
      return cached;
    }

    if (pendingRequest) {
      return pendingRequest;
    }

    const requestVersion = cacheVersion;

    pendingRequest = loadData()
      .then((data) => {
        if (requestVersion === cacheVersion) {
          cachedData = data;
          cachedAt = Date.now();
        }

        return data;
      })
      .finally(() => {
        pendingRequest = null;
      });

    return pendingRequest;
  }

  function clear() {
    cacheVersion += 1;
    cachedData = null;
    cachedAt = 0;
    pendingRequest = null;
  }

  return {
    clear,
    get,
    getCached,
  };
}

export function createKeyedMemoryCache<T>() {
  const cachedData = new Map<string, { data: T; cachedAt: number }>();
  const pendingRequests = new Map<string, Promise<T>>();
  let cacheVersion = 0;

  function getCached(key: string, options: CacheOptions = {}) {
    const cached = cachedData.get(key);

    if (!cached || !isFresh(cached.cachedAt, options.ttlMs)) {
      return null;
    }

    return cached.data;
  }

  async function get(
    key: string,
    loadData: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = getCached(key, options);

    if (cached !== null) {
      return cached;
    }

    const pendingRequest = pendingRequests.get(key);

    if (pendingRequest) {
      return pendingRequest;
    }

    const requestVersion = cacheVersion;
    const request = loadData()
      .then((data) => {
        if (requestVersion === cacheVersion) {
          cachedData.set(key, {
            data,
            cachedAt: Date.now(),
          });
        }

        return data;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, request);

    return request;
  }

  function clear() {
    cacheVersion += 1;
    cachedData.clear();
    pendingRequests.clear();
  }

  return {
    clear,
    get,
    getCached,
  };
}
