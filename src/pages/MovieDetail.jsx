import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, ArrowLeft, PlayCircle, Users } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const MovieDetail = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMovie(null);
    
    const fetchMovieDetails = async () => {
      try {
        const [movieRes, similarRes] = await Promise.all([
          fetch(`/api/${mediaType}/${id}`),
          fetch(`/api/${mediaType}/${id}/similar`)
        ]);

        if (!movieRes.ok) {
           throw new Error(`HTTP Error ${movieRes.status}`);
        }

        const movieData = await movieRes.json();
        const similarData = await similarRes.json().catch(() => ({}));

        if (movieData.success === false || movieData.error) {
           throw new Error(movieData.error || "API returned error");
        }

        setMovie(movieData);
        setSimilar(similarData.results?.slice(0, 4) || []);
      } catch (err) {
        console.error("Error fetching details:", err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const trailer = movie?.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || movie?.videos?.results?.[0];
  const cast = movie?.credits?.cast?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Backdrop Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10" />
        <img 
          src={`https://image.tmdb.org/t/p/original${movie?.backdrop_path}`} 
          className="w-full h-full object-cover transform scale-105 animate-pulse-slow opacity-60"
          alt=""
        />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-orange-500 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-40 relative z-20">
        <div className="grid lg:grid-cols-[350px_1fr] gap-12">
          {/* Poster */}
          <div className="hidden lg:block relative group">
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`} 
              className="rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10"
              alt={movie?.title}
            />
          </div>

          {/* Details */}
          <div className="pt-10">
            <div className="flex flex-wrap gap-2 mb-6">
              {movie?.genres?.map(g => (
                <span key={g.id} className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/5">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">
              {movie?.title || movie?.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/60 mb-8 font-bold uppercase tracking-widest text-xs">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md border border-white/10 text-white">
                <Star size={16} className="text-yellow-500 fill-yellow-500" /> 
                {movie?.vote_average?.toFixed(1)} Rating
              </span>
              <span className="flex items-center gap-2"><Clock size={16} /> {movie?.runtime || movie?.episode_run_time?.[0] || 'N/A'} MIN</span>
              <span className="flex items-center gap-2"><Calendar size={16} /> {movie?.release_date || movie?.first_air_date}</span>
            </div>

            <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-12 font-light">
              {movie?.overview}
            </p>

            {trailer && (
              <div className="mb-16">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <PlayCircle className="text-orange-500" /> Official Trailer
                </h3>
                <div className="aspect-video w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe 
                    src={`https://www.youtube.com/embed/${trailer.key}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {cast.length > 0 && (
              <div className="mb-16">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <Users className="text-orange-500" /> Top Cast
                </h3>
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                  {cast.map(person => (
                    <div key={person.id} className="flex flex-col items-center min-w-[120px] text-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10">
                        {person.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/40"><Users size={32} /></div>
                        )}
                      </div>
                      <p className="font-semibold text-sm line-clamp-1">{person.name}</p>
                      <p className="text-white/50 text-xs mt-1 line-clamp-1">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies Section */}
        {similar.length > 0 && (
          <div className="mt-24 border-t border-white/5 pt-16">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-orange-500"></span>
              More like this
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similar.map(m => (
                <MovieCard key={m.id} movie={{...m, media_type: mediaType}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

