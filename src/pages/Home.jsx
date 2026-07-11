import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import MovieModal from '../components/MovieModal';
import SplitText from '../components/SplitText';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [activeTab, setActiveTab] = useState('trending'); // trending, top-rated, upcoming, now-playing, discover
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const navigate = useNavigate();

  const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'tv'

  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    fetch(`/api/${mediaType === 'movie' ? 'movies' : 'tv'}/genres`)
      .then(res => res.json())
      .then(data => {
        setGenres(data.genres || []);
        if (activeTab === 'discover' && data.genres && data.genres.length > 0) {
          setSelectedGenre(data.genres[0].id.toString());
        }
      })
      .catch(console.error);
  }, [mediaType]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const mediaRoute = mediaType === 'movie' ? 'movies' : 'tv';
      let endpoint = `/api/${mediaRoute}/trending`;
      
      if (searchQuery) {
        endpoint = `/api/${mediaRoute}/search?query=${encodeURIComponent(searchQuery)}`;
      } else if (activeTab === 'discover' && selectedGenre) {
        endpoint = `/api/${mediaRoute}/discover?with_genres=${selectedGenre}`;
      } else if (activeTab === 'top-rated') {
        endpoint = `/api/${mediaRoute}/top-rated`;
      } else if (activeTab === 'upcoming') {
        endpoint = mediaType === 'movie' ? '/api/movies/upcoming' : '/api/tv/on-the-air';
      } else if (activeTab === 'now-playing') {
        endpoint = mediaType === 'movie' ? '/api/movies/now-playing' : '/api/tv/popular';
      } else {
        endpoint = `/api/${mediaRoute}/trending`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch movies');
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMovies(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
       setActiveTab('');
    } else if (!activeTab) {
       setActiveTab('trending');
    }
    fetchMovies();
  }, [searchQuery, activeTab, selectedGenre, mediaType]);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-orange-500 font-bold">Error: {error}</p>
      <button onClick={fetchMovies} className="bg-orange-500 px-6 py-2 rounded-full text-white font-medium">Retry</button>
    </div>
  );

  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'now-playing', label: 'Now Playing' },
    { id: 'top-rated', label: 'Top Rated' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'discover', label: 'Genres' }
  ];

  return (
    <div className="pb-20">
      {/* Mobile Search Bar */}
      <div className="px-6 pt-6 pb-2 lg:hidden">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text"
            placeholder="Search movies..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition text-base"
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        </form>
      </div>

      {/* Hero Section - Only shows on main trending page without search */}
      {!searchQuery && activeTab === 'trending' && movies[0] && (
        <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
          <img 
            src={`https://image.tmdb.org/t/p/original${movies[0].backdrop_path}`} 
            className="w-full h-full object-cover opacity-50"
            alt="Hero Backdrop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute bottom-10 left-6 md:left-12 max-w-2xl">
            <h1 className="text-4xl md:text-7xl font-playfair font-black mb-4 leading-tight">{movies[0].title || movies[0].name}</h1>
            <p className="text-white/70 line-clamp-3 mb-6 text-sm md:text-base">{movies[0].overview}</p>
            <div className="flex gap-4 items-center">
               <span className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm">Rating: {movies[0].vote_average?.toFixed(1)}</span>
               <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">Release: {movies[0].release_date || movies[0].first_air_date}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 mt-10">
        
        {/* Modern Words Section */}
        {!searchQuery && (
          <div className="mb-12 flex flex-col items-center text-center overflow-hidden">
            <SplitText
              text={mediaType === 'movie' ? "Discover your next cinematic obsession." : "Explore the world of television."}
              className="text-4xl md:text-5xl lg:text-6xl font-playfair font-black tracking-tighter mb-4 text-white"
              delay={50}
              duration={1.25}
              ease="power3.out"
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
              tag="h2"
            />
            <SplitText
              text={`Dive into trending ${mediaType === 'movie' ? 'movies' : 'shows'}, top-rated classics, and hidden gems across all genres.`}
              className="text-white/50 max-w-2xl text-sm md:text-base"
              delay={20}
              duration={1}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
              tag="p"
            />
          </div>
        )}

        {/* Media Type Toggle */}
        {!searchQuery && (
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 p-1 rounded-full flex gap-1">
              <button
                onClick={() => {
                  setMediaType('movie');
                  setActiveTab('trending');
                  setSelectedGenre('');
                }}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  mediaType === 'movie' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => {
                  setMediaType('tv');
                  setActiveTab('trending');
                  setSelectedGenre('');
                }}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  mediaType === 'tv' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                TV Series
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {!searchQuery && (
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 justify-start sm:justify-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'discover' && !selectedGenre && genres.length > 0) {
                      setSelectedGenre(genres[0].id.toString());
                    }
                  }}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Genre Selection sub-menu */}
            {activeTab === 'discover' && genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id.toString())}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      selectedGenre === genre.id.toString()
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-8">
          {searchQuery ? `Search Results for "${searchQuery}"` : 
           activeTab === 'discover' ? `${genres.find(g => g.id.toString() === selectedGenre)?.name || ''} Movies` :
           tabs.find(t => t.id === activeTab)?.label || 'Movies'}
        </h2>
        
        {movies.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <p className="text-xl">No movies found.</p>
            <p className="text-sm mt-2">Try a different selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading 
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) 
              : movies.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={{...m, media_type: mediaType}} onClick={() => setSelectedMovie({...m, media_type: mediaType})} />)
            }
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal movieData={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
};

export default Home;