import { useState } from 'react';
import { useMovieContext } from '../context/MovieContext';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { HeartOff } from 'lucide-react';

const Watchlist = () => {
  const { watchlist } = useMovieContext();
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-playfair font-black mb-10">My Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-4">
          <HeartOff className="w-16 h-16 opacity-20" />
          <p className="text-xl font-medium">Your watchlist is empty.</p>
          <p className="text-sm">Movies and TV shows you heart will appear here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
          ))}
        </div>
      )}

      {selectedMovie && (
        <MovieModal movieData={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
};

export default Watchlist;
