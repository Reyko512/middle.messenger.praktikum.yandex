import { API_RESOURCES } from '@shared/config/api';

export function buildAvatarURL(path: string | null) {
  if (!path) {
    return null;
  }

  return `${API_RESOURCES}${path}`;
}
