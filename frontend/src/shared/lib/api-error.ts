/**
 * Extracts a human-readable error message from an unknown error,
 * typically an Axios error returned from the backend.
 */
export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  if (typeof error === "object" && error !== null) {
    const maybeAxios = error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    };
    const msg = maybeAxios.response?.data?.message;
    if (Array.isArray(msg) && msg.length > 0) return msg[0];
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (typeof maybeAxios.message === "string" && maybeAxios.message.length > 0) {
      return maybeAxios.message;
    }
  }
  return fallback;
};
