export const tmdbRequest = async (endpoint: string, queryParams: Record<string, string> = {}) => {
  // @ts-ignore
  const token = import.meta.env.VITE_TMDB_TOKEN || import.meta.env.TMDB_TOKEN;
  if (!token) {
    throw new Error('VITE_TMDB_TOKEN or TMDB_TOKEN is not configured');
  }

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const tmdbRequestMultiPage = async (endpoint: string, queryParams: Record<string, string> = {}, pages = 2) => {
  const allResults: any[] = [];
  let baseData: any = null;

  for (let page = 1; page <= pages; page++) {
    const data = await tmdbRequest(endpoint, { ...queryParams, page: page.toString() });
    if (!baseData) baseData = data;
    if (data.results) {
      allResults.push(...data.results);
    }
  }

  if (baseData && allResults.length > 0) {
    baseData.results = allResults;
  }
  return baseData;
};
