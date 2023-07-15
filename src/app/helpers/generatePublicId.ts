/**
 * Generates public id from text
 * It gets title in "en" language and replace all spaces with "-"
 * All other symbols are removed
 */
export function generatePublicId(text: string): string {
	return text
		.trim()
		.replaceAll(/\s/g, '-')
		.replaceAll(/[^\dA-Za-z-]/g, '')
		.toLowerCase();
}
