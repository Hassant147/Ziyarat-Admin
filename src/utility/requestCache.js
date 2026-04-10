const inFlightRequests = new Map();
const responseCache = new Map();

const getCurrentTime = () => Date.now();

const isCacheEntryValid = (entry) =>
  Boolean(entry) && entry.expiresAt > getCurrentTime();

const normalizeKeyPart = (value) => String(value).trim();

const matchesKey = (key, matcher) => {
  if (typeof matcher === "function") {
    return matcher(key);
  }

  if (matcher instanceof RegExp) {
    return matcher.test(key);
  }

  if (Array.isArray(matcher)) {
    return matcher.some((entry) => matchesKey(key, entry));
  }

  const normalizedMatcher = normalizeKeyPart(matcher);
  return key === normalizedMatcher || key.startsWith(`${normalizedMatcher}:`);
};

export const buildSharedRequestKey = (...parts) =>
  parts
    .flat()
    .filter((part) => part !== undefined && part !== null && `${part}`.trim() !== "")
    .map(normalizeKeyPart)
    .join(":");

export const runSharedRequest = async ({
  key,
  request,
  cacheTtlMs = 1500,
  skipCache = false,
} = {}) => {
  const normalizedKey = normalizeKeyPart(key);
  if (!normalizedKey || typeof request !== "function") {
    throw new Error("A request key and request function are required.");
  }

  const activeRequest = inFlightRequests.get(normalizedKey);
  if (activeRequest) {
    return activeRequest;
  }

  if (!skipCache) {
    const cachedResponse = responseCache.get(normalizedKey);
    if (isCacheEntryValid(cachedResponse)) {
      return cachedResponse.value;
    }

    responseCache.delete(normalizedKey);
  }

  const requestPromise = (async () => {
    try {
      const response = await request();

      if (cacheTtlMs > 0) {
        responseCache.set(normalizedKey, {
          value: response,
          expiresAt: getCurrentTime() + cacheTtlMs,
        });
      }

      return response;
    } finally {
      inFlightRequests.delete(normalizedKey);
    }
  })();

  inFlightRequests.set(normalizedKey, requestPromise);
  return requestPromise;
};

export const invalidateSharedRequest = (matcher) => {
  Array.from(responseCache.keys()).forEach((key) => {
    if (matchesKey(key, matcher)) {
      responseCache.delete(key);
    }
  });
};
