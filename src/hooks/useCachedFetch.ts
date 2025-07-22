export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit, 
): Promise<T> {
  const response = await fetch(url, options);
    
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const json = await response.json();
  return json as T;
}