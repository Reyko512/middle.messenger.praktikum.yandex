import { HTTPError } from '@shared/lib/http';

const SESSION_EXPIRED_REASON = 'Cookie is not valid';
const SESSION_EXPIRED_MESSAGE = 'Session expired. Sign in again.';

function hasReason(value: unknown): value is { reason: string } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'reason' in value && typeof value.reason === 'string';
}

export function isSessionExpiredError(error: unknown) {
  if (error instanceof HTTPError) {
    return (
      error.status === 401 &&
      hasReason(error.reason) &&
      error.reason.reason === SESSION_EXPIRED_REASON
    );
  }

  if (error instanceof Error) {
    return error.message === SESSION_EXPIRED_REASON;
  }

  return false;
}

export function normalizeError(error: unknown) {
  if (isSessionExpiredError(error)) {
    return SESSION_EXPIRED_MESSAGE;
  }

  if (error instanceof HTTPError) {
    if (hasReason(error.reason)) {
      return error.reason.reason;
    }

    return `Request failed with status ${error.status}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}
