import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

const MovieCard = ({ movie, onClick }) => {
  const { isWatchlisted, addToWatchlist, removeFromWatchlist } = useMovieContext();
  const exists = isWatchlisted(movie.id);

  const toggleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (exists) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const CardWrapper = onClick ? 'div' : Link;
  const wrapperProps = onClick 
    ? { onClick, className: "group relative bg-white/5 rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:bg-white/10 cursor-pointer text-left" }
    : { to: `/${movie.media_type || 'movie'}/${movie.id}`, className: "group relative bg-white/5 rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:bg-white/10" };

  return (
    <CardWrapper {...wrapperProps}>
      <div className="relative aspect-[2/3] w-full">
        <img 
          src={movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Poster'} 
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button 
          onClick={toggleWatchlist}
          className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-full text-white transition-colors hover:text-orange-500 z-10"
          aria-label={exists ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Heart className={exists ? "fill-orange-500 text-orange-500" : ""} size={20} />
        </button>
      </div>

      <div className="p-3">
        <h3 className="font-bold truncate text-sm text-white">{movie.title || movie.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span>{movie.vote_average?.toFixed(1) || '0.0'}</span>
          <span className="mx-1">•</span>
          <span>{(movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A'}</span>
        </div>
      </div>
    </CardWrapper>
  );
};

export default MovieCard;
