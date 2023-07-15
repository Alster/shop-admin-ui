/**
 * Generates string with random characters of range [A-Z0-9]
 */
export function generateRandomString(length: number): string {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let text = '';
	for (let index = 0; index < length; index++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
