export function fetchAPI(path: string, options: RequestInit = {}, query = ""): Promise<Response> {
  return fetch(`http://localhost:3000/${path}${query ? "?" + query : ""}`, {
    ...{
      headers: {
        'Content-Type': 'application/json'
      },
    },
    ...options,
  })
}
