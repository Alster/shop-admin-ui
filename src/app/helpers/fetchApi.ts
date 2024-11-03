const baseUrl = process.env["NEXT_PUBLIC_ADMIN_API_URL"]!;

if (!baseUrl) {
	throw new Error(`Environment variable for NEXT_PUBLIC_ADMIN_API_URL is not set`);
}

export async function fetchApi(
	path: string,
	options: RequestInit = {},
	query = "",
): Promise<Response> {
	const url = new URL(path + (query ? "?" + query : ""), baseUrl);
	return fetch(url, {
		headers: {
			"Content-Type": "application/json",
		},
		...options,
	});
}
