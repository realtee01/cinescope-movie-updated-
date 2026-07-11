import { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, PlayCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieModal = ({ movieData, onClose }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!movieData?.id) return;
    
    setLoading(true);
    const type = movieData.media_type || 'movie';
    fetch(`/api/${type}/${movieData.id}`)
      .then(async res => {
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success === false || data.error) {
           throw new Error(data.error || "API returned error");
        }
        setMovie(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching movie details:", err.message || err);
        setLoading(false);
        setMovie(null);
      });
  }, [movieData?.id, movieData?.media_type]);

  if (!movieData?.id) return null;

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
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>

        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : movie ? (
          <div className="overflow-y-auto scrollbar-hide flex-1">
            {/* Hero / Backdrop */}
            <div className="relative h-[40vh] min-h-[300px] w-full bg-[#0a0a0a]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10" />
              <img 
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                alt={movie.title || movie.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent">
                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres?.map(g => (
                    <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/5 text-white">
                      {g.name}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight text-white mb-2">
                  {movie.title || movie.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> 
                    {movie.vote_average?.toFixed(1)} Rating
                  </span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {movie.runtime || movie.episode_run_time?.[0] || 'N/A'} MIN</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {movie.release_date || movie.first_air_date}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              <p className="text-lg text-white/80 leading-relaxed font-light mb-8">
                {movie.overview}
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    onClose();
                    navigate(`/${movieData?.media_type || 'movie'}/${movie.id}`);
                  }}
                  className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wide hover:scale-105 transition-transform"
                >
                  View Full Page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex items-center justify-center">
            <p className="text-white/50">Failed to load movie details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
