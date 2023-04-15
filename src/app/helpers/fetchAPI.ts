export function fetchAPI(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`http://localhost:3000/${path}`, options)
}
