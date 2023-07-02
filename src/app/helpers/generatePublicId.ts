/**
 * Generates public id from text
 * It gets title in "en" language and replace all spaces with "-"
 * All other symbols are removed
 */
export function generatePublicId(text: string): string {
  return text
    .trim()
    .replace(/\s/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}
