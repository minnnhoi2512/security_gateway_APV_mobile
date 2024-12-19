import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorFormObject {
  [key: string | number]: string | ErrorFormObject | ErrorFormObject[];
}
interface EntityError {
  status: 400;
  data: {
    errors: ErrorFormObject;
  };
}
const fetchWithTimeout = (promise: any, timeout: any) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
};
const formatDateTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export function isFerchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}

export function isEntityError(error: unknown): error is EntityError {
  return (
    isFerchBaseQueryError(error) &&
    error.status === 400 &&
    typeof error.data === "object" &&
    error.data !== null
    //!(error.data instanceof Array)
  );
}
export function getCurrentFormattedTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const day = now.getDate();
  const month = now.getMonth() + 1; // Months are zero-based
  const year = now.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}
export { fetchWithTimeout, formatDateTime };
