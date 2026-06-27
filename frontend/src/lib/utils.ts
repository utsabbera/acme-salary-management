import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a human-readable error message from an API error response.
 * @param error The error caught from a try/catch block (often from hey-api/client-fetch)
 * @param fallback A default message if the error format is unrecognized
 * @returns A clear error message string
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "An unknown error occurred.",
): string {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    const apiError = errObj.error as
      | { message?: string; details?: Array<{ field?: string; issue?: string }> }
      | undefined;

    const firstDetail = apiError?.details?.[0];
    if (firstDetail?.field && firstDetail?.issue) {
      return `Field '${firstDetail.field}' is invalid: ${firstDetail.issue}`;
    }

    if (apiError?.message) return apiError.message;
    if (typeof errObj.message === "string") return errObj.message;
  }

  return fallback;
}
