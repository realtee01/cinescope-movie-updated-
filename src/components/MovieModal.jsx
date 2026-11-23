import { useState, useEffect, useCallback } from 'react';
import { X, Star, Clock, Calendar, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieModal = ({ movieData, onClose }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const rawType = movieData?.media_type || movieData?.mediaType;
  const mediaType = rawType === 'tv' ? 'tv' : 'movie';

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!movieData?.id) return;

    const controller = new AbortController();
    let isActive = true;

    const loadDetails = async () => {
      setLoading(true);
      setFetchError(null);

      let lastErr = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(`/api/${mediaType}/${movieData.id}`, {
            signal: controller.signal,
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error ${res.status}`);
          }
          const data = await res.json();
          if (data.success === false || data.error) {
            throw new Error(data.error || 'API returned error');
          }
          if (isActive) {
            setMovie(data);
            setLoading(false);
          }
          return;
        } catch (err) {
          if (err?.name === 'AbortError' || !isActive) return;
          lastErr = err;
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          }
        }
      }

      if (isActive) {
        // Gracefully fall back to the card's existing summary data if the network request fails
        setFetchError(lastErr?.message || 'Unable to load full details.');
        setMovie(movieData);
        setLoading(false);
      }
    };

    loadDetails();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [movieData?.id, mediaType, retryCount]);

  if (!movieData?.id) return null;

  const displayMovie = movie || movieData;
  const imagePath = displayMovie?.backdrop_path || displayMovie?.poster_path;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-[#121212] rounded-2xl shadow-2xl overflow-hidden z-10 border border-white/10 animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>

        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayMovie ? (
          <div className="overflow-y-auto scrollbar-hide flex-1">
            {/* Hero / Backdrop */}
            <div className="relative h-[40vh] min-h-[300px] w-full bg-[#0a0a0a]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10" />
              {imagePath ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${imagePath}`}
                  alt={displayMovie.title || displayMovie.name}
                  className="w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-[#121212] to-black" />
              )}
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent">
                <div className="flex flex-wrap gap-2 mb-3">
                  {displayMovie.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/5 text-white"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight text-white mb-2">
                  {displayMovie.title || displayMovie.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {displayMovie.vote_average?.toFixed(1) || 'N/A'} Rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />{' '}
                    {displayMovie.runtime || displayMovie.episode_run_time?.[0] || 'N/A'} MIN
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />{' '}
                    {displayMovie.release_date || displayMovie.first_air_date || 'TBA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              {displayMovie?.['watch/providers']?.results?.US?.flatrate?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
                    Available On
                  </h3>
                  <div className="flex gap-2">
                    {displayMovie['watch/providers'].results.US.flatrate.map((provider) => (
                      <img
                        key={provider.provider_id}
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="w-8 h-8 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-lg text-white/80 leading-relaxed font-light mb-8">
                {displayMovie.overview || 'No synopsis available for this title.'}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/${mediaType}/${displayMovie.id}`);
                  }}
                  className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wide hover:scale-105 transition-transform"
                >
                  View Full Page
                </button>
                {fetchError && (
                  <button
                    onClick={handleRetry}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors border border-white/10"
                  >
                    <RotateCw size={15} /> Reload Full Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <p className="text-white/50">Unable to load movie details.</p>
            <button
              onClick={handleRetry}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <RotateCw size={15} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
