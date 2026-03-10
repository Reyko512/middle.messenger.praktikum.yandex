const TAG_PATTERN = /<[^>]*>/g;
const MULTI_SPACE_PATTERN = /\s+/g;

export function sanitizeText(value: string) {
  return value
    .replace(TAG_PATTERN, '')
    .replace(MULTI_SPACE_PATTERN, ' ')
    .trim();
}
