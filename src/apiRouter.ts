import express from 'express';

const router = express.Router();

const tmdbRequest = async (endpoint: string, queryParams: Record<string, string> = {}) => {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    throw new Error('TMDB_TOKEN is not configured');
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

const tmdbRequestMultiPage = async (endpoint: string, queryParams: Record<string, string> = {}, pages = 2) => {
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

// API routes
router.get("/movies/trending", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/trending/movie/week');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/top-rated", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/movie/top_rated');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/upcoming", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/movie/upcoming');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/now-playing", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/movie/now_playing');
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
    const data = await tmdbRequestMultiPage('/discover/movie', { with_genres });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/movies/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    const data = await tmdbRequestMultiPage('/search/movie', { query });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TV Routes
router.get("/tv/trending", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/trending/tv/week');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/top-rated", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/tv/top_rated');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/popular", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/tv/popular');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/on-the-air", async (req, res) => {
  try {
    const data = await tmdbRequestMultiPage('/tv/on_the_air');
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
    const data = await tmdbRequestMultiPage('/discover/tv', { with_genres });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    const data = await tmdbRequestMultiPage('/search/tv', { query });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tv/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/tv/${id}`, { append_to_response: 'videos,credits,reviews' });
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

router.get(["/movies/:id", "/movie/:id"], async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbRequest(`/movie/${id}`, { append_to_response: 'videos,credits,reviews' });
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

export default router;
