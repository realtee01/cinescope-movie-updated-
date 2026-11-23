import express from 'express';

const router = express.Router();

const tmdbRequest = async (endpoint: string, queryParams: Record<string, string> = {}, retries = 2) => {
  const token = process.env.TMDB_TOKEN || process.env.VITE_TMDB_TOKEN;
  if (!token) {
    throw new Error('TMDB_TOKEN is not configured');
  }
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) url.searchParams.append(key, value);
  }

  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status >= 500 && attempt < retries) {
          await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  throw lastError;
};

const tmdbFetchBatch = async (
  endpoint: string,
  queryParams: Record<string, string> = {},
  startPage = 1,
  pageCount = 3
) => {
  const safeStart = Math.max(1, Math.min(500, startPage));
  const safeCount = Math.max(1, Math.min(5, pageCount));
  const pageNumbers = Array.from({ length: safeCount }, (_, i) => safeStart + i).filter(p => p <= 500);

  const settled = await Promise.allSettled(
    pageNumbers.map(page => tmdbRequest(endpoint, { ...queryParams, page: page.toString() }))
  );

  const seen = new Set<number>();
  const allResults: any[] = [];
  let baseData: any = null;
  let lastFetchedPage = safeStart;

  for (let i = 0; i < settled.length; i++) {
    const res = settled[i];
    if (res.status === 'fulfilled' && res.value) {
      const data = res.value;
      if (!baseData) baseData = { ...data };
      lastFetchedPage = pageNumbers[i];
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          if (item?.id && !seen.has(item.id)) {
            seen.add(item.id);
            allResults.push(item);
          }
        }
      }
    }
  }

  if (!baseData) {
    const firstError = settled.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
    throw firstError?.reason || new Error('Failed to fetch data from TMDB');
  }

  const totalPages = Math.min(baseData.total_pages || 1, 500);
  return {
    ...baseData,
    page: safeStart,
    last_page_fetched: Math.min(lastFetchedPage, totalPages),
    next_page: lastFetchedPage < totalPages ? lastFetchedPage + 1 : null,
    total_pages: totalPages,
    results: allResults,
  };
};

const parsePagination = (req: express.Request, defaultCount = 3) => {
  const page = parseInt(req.query.page as string, 10);
  const count = parseInt(req.query.count as string, 10);
  return {
    startPage: Number.isFinite(page) && page > 0 ? page : 1,
    pageCount: Number.isFinite(count) && count > 0 ? count : defaultCount,
  };
};

// Movie Routes
router.get("/movies/trending", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/trending/movie/week', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/popular", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/movie/popular', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/top-rated", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/movie/top_rated', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/upcoming", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/movie/upcoming', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/now-playing", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/movie/now_playing', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/genres", async (req, res) => {
  try {
    const data = await tmdbRequest('/genre/movie/list');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/discover", async (req, res) => {
  try {
    const with_genres = req.query.with_genres as string;
    const { startPage, pageCount } = parsePagination(req, req.query.single === 'true' ? 1 : 3);
    const data = await tmdbFetchBatch('/discover/movie', { with_genres }, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    const { startPage, pageCount } = parsePagination(req, 2);
    const data = await tmdbFetchBatch('/search/movie', { query }, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TV Routes
router.get("/tv/trending", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/trending/tv/week', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/top-rated", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/tv/top_rated', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/popular", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/tv/popular', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/on-the-air", async (req, res) => {
  try {
    const { startPage, pageCount } = parsePagination(req, 3);
    const data = await tmdbFetchBatch('/tv/on_the_air', {}, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/genres", async (req, res) => {
  try {
    const data = await tmdbRequest('/genre/tv/list');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/discover", async (req, res) => {
  try {
    const with_genres = req.query.with_genres as string;
    const { startPage, pageCount } = parsePagination(req, req.query.single === 'true' ? 1 : 3);
    const data = await tmdbFetchBatch('/discover/tv', { with_genres }, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    const { startPage, pageCount } = parsePagination(req, 2);
    const data = await tmdbFetchBatch('/search/tv', { query }, startPage, pageCount);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/tv/${id}`, { append_to_response: 'videos,credits,reviews,watch/providers' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, success: false });
  }
});

router.get("/tv/:id/similar", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/tv/${id}/similar`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, success: false });
  }
});

router.get("/tv/:id/season/:season_number", async (req, res) => {
  try {
    const { id, season_number } = req.params;
    const data = await tmdbRequest(`/tv/${id}/season/${season_number}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, success: false });
  }
});

router.get(["/movies/:id", "/movie/:id"], async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/movie/${id}`, { append_to_response: 'videos,credits,reviews,watch/providers' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, success: false });
  }
});

router.get(["/movies/:id/similar", "/movie/:id/similar"], async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/movie/${id}/similar`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/person/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/person/${id}`, { append_to_response: 'movie_credits,tv_credits,images' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, success: false });
  }
});

export default router;
