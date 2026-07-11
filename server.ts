import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // TMDB Helper
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

  // API routes FIRST
  app.get("/api/movies/trending", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/trending/movie/week');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/movies/top-rated", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/movie/top_rated');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/movies/upcoming", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/movie/upcoming');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/movies/now-playing", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/movie/now_playing');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/movies/genres", async (req, res) => {
    try {
      const data = await tmdbRequest('/genre/movie/list');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/movies/discover", async (req, res) => {
    try {
      const with_genres = req.query.with_genres as string;
      const data = await tmdbRequestMultiPage('/discover/movie', { with_genres });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      const data = await tmdbRequestMultiPage('/search/movie', { query });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // TV Routes
  app.get("/api/tv/trending", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/trending/tv/week');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/top-rated", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/tv/top_rated');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/popular", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/tv/popular');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/on-the-air", async (req, res) => {
    try {
      const data = await tmdbRequestMultiPage('/tv/on_the_air');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/genres", async (req, res) => {
    try {
      const data = await tmdbRequest('/genre/tv/list');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/discover", async (req, res) => {
    try {
      const with_genres = req.query.with_genres as string;
      const data = await tmdbRequestMultiPage('/discover/tv', { with_genres });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      const data = await tmdbRequestMultiPage('/search/tv', { query });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tv/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await tmdbRequest(`/tv/${id}`, { append_to_response: 'videos,credits,reviews' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message, success: false });
    }
  });

  app.get("/api/tv/:id/similar", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await tmdbRequest(`/tv/${id}/similar`);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message, success: false });
    }
  });

  app.get(["/api/movies/:id", "/api/movie/:id"], async (req, res) => {
    try {
      const { id } = req.params;
      const data = await tmdbRequest(`/movie/${id}`, { append_to_response: 'videos,credits,reviews' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message, success: false });
    }
  });

  app.get(["/api/movies/:id/similar", "/api/movie/:id/similar"], async (req, res) => {
    try {
      const { id } = req.params;
      const data = await tmdbRequest(`/movie/${id}/similar`);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
