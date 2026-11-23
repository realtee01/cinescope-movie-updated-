import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Play, Volume2, VolumeX, Package, Loader2 } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import MovieModal from '../components/MovieModal';
import SplitText from '../components/SplitText';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const urlMediaType = searchParams.get('type');
  const [activeTab, setActiveTab] = useState('trending');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState(urlMediaType === 'tv' ? 'tv' : 'movie');

  // Hero Trailer & Roulette State
  const [heroMovieData, setHeroMovieData] = useState(null);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isSurprising, setIsSurprising] = useState(false);

  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    if (urlMediaType === 'tv' || urlMediaType === 'movie') {
      setMediaType(urlMediaType);
      setActiveTab('trending');
      setSelectedGenre('');
    }
  }, [urlMediaType]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSurpriseMe = async () => {
    setIsSurprising(true);
    try {
      const type = mediaType === 'movie' ? 'movies' : 'tv';
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const res = await fetch(`/api/${type}/discover?page=${randomPage}&single=true`);
      const data = await res.json();
      if (data.results?.length > 0) {
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        setSelectedMovie({ ...randomMovie, media_type: mediaType });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSurprising(false);
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

  const buildEndpoint = useCallback((page = 1, count = 3) => {
    const mediaRoute = mediaType === 'movie' ? 'movies' : 'tv';
    if (searchQuery) {
      return `/api/${mediaRoute}/search?query=${encodeURIComponent(searchQuery)}&page=${page}&count=${count}`;
    }
    if (activeTab === 'discover' && selectedGenre) {
      return `/api/${mediaRoute}/discover?with_genres=${selectedGenre}&page=${page}&count=${count}`;
    }
    if (activeTab === 'popular') {
      return `/api/${mediaRoute}/popular?page=${page}&count=${count}`;
    }
    if (activeTab === 'top-rated') {
      return `/api/${mediaRoute}/top-rated?page=${page}&count=${count}`;
    }
    if (activeTab === 'upcoming') {
      return mediaType === 'movie'
        ? `/api/movies/upcoming?page=${page}&count=${count}`
        : `/api/tv/on-the-air?page=${page}&count=${count}`;
    }
    if (activeTab === 'now-playing') {
      return mediaType === 'movie'
        ? `/api/movies/now-playing?page=${page}&count=${count}`
        : `/api/tv/on-the-air?page=${page}&count=${count}`;
    }
    return `/api/${mediaRoute}/trending?page=${page}&count=${count}`;
  }, [mediaType, searchQuery, activeTab, selectedGenre]);

  const fetchMovies = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const count = append ? 2 : 3; // 60 titles initially, +40 per Load More click
      const endpoint = buildEndpoint(page, count);
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch movies');
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const incoming = data.results || [];
      setMovies(prev => {
        if (!append) return incoming;
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueIncoming = incoming.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueIncoming];
      });
      setNextPage(data.next_page || null);
      setTotalResults(data.total_results || incoming.length);
    } catch (err) {
      if (!append) setError(err.message);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [buildEndpoint]);

  useEffect(() => {
    if (searchQuery) {
      setActiveTab('');
    } else if (!activeTab) {
      setActiveTab('trending');
    }
    fetchMovies(1, false);
  }, [searchQuery, activeTab, selectedGenre, mediaType, fetchMovies]);

  const handleLoadMore = () => {
    if (nextPage && !loadingMore) {
      fetchMovies(nextPage, true);
    }
  };

  useEffect(() => {
    if (movies.length > 0 && !searchQuery && activeTab === 'trending') {
      const controller = new AbortController();
      let timer;
      const heroMovieId = movies[0].id;
      const type = mediaType === 'movie' ? 'movie' : 'tv';
      fetch(`/api/${type}/${heroMovieId}`, { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setHeroMovieData(data);
          setShowTrailer(false);
          timer = setTimeout(() => {
            if (data?.videos?.results?.some(v => v.site === 'YouTube' && v.type === 'Trailer')) {
              setShowTrailer(true);
            }
          }, 3000);
        })
        .catch(err => {
          if (err?.name !== 'AbortError') console.error(err);
        });
      return () => {
        controller.abort();
        if (timer) clearTimeout(timer);
      };
    } else {
      setHeroMovieData(null);
      setShowTrailer(false);
    }
  }, [movies[0]?.id, mediaType, searchQuery, activeTab]);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-orange-500 font-bold">Error: {error}</p>
      <button onClick={() => fetchMovies(1, false)} className="bg-orange-500 px-6 py-2 rounded-full text-white font-medium">Retry</button>
    </div>
  );

  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'popular', label: 'Popular' },
    { id: 'now-playing', label: mediaType === 'movie' ? 'Now Playing' : 'On The Air' },
    { id: 'top-rated', label: 'Top Rated' },
    ...(mediaType === 'movie' ? [{ id: 'upcoming', label: 'Upcoming' }] : []),
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
      {!searchQuery && activeTab === 'trending' && (
        <div className="relative w-full bg-[#0a0a0a] h-[75vh] md:h-[80vh] overflow-hidden">
          {movies[0] ? (
            <>
              {/* Media Container */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {showTrailer && heroMovieData?.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') ? (
                  <div className="absolute inset-0 z-0">
                     <iframe
                       src={`https://www.youtube.com/embed/${heroMovieData.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer').key}?autoplay=1&mute=${isHeroMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${heroMovieData.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer').key}`}
                       title="Trailer"
                       className="w-[300vw] h-[300vh] -ml-[100vw] -mt-[100vh] md:w-[150vw] md:h-[150vh] md:-ml-[25vw] md:-mt-[25vh] pointer-events-none"
                       frameBorder="0"
                       allow="autoplay; encrypted-media"
                     ></iframe>
                     <button 
                       onClick={() => setIsHeroMuted(!isHeroMuted)}
                       className="absolute bottom-6 right-6 md:bottom-10 md:right-12 z-30 p-2 md:p-3 rounded-full bg-black/50 border border-white/20 text-white hover:bg-white/10 transition pointer-events-auto backdrop-blur-md"
                       aria-label={isHeroMuted ? 'Unmute trailer' : 'Mute trailer'}
                     >
                       {isHeroMuted ? <VolumeX size={20} className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 size={20} className="w-4 h-4 md:w-5 md:h-5" />}
                     </button>
                  </div>
                ) : (
                  <img 
                    src={`https://image.tmdb.org/t/p/original${movies[0].backdrop_path}`} 
                    className="w-full h-full object-cover opacity-80 animate-in fade-in duration-1000"
                    alt={movies[0].title || movies[0].name || 'Hero Backdrop'}
                  />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 md:via-[#0a0a0a]/60 to-transparent md:to-[#0a0a0a]/20 z-10 pointer-events-none" />
              </div>
              
              {/* Text Container */}
              <div className="absolute bottom-8 left-6 right-6 md:bottom-10 md:left-12 md:right-auto px-0 w-auto max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-1000 z-20 pointer-events-none">
                <h1 className="text-4xl md:text-7xl font-playfair font-black mb-4 leading-tight">{movies[0].title || movies[0].name}</h1>
                <p className="text-white/70 line-clamp-3 mb-6 text-sm md:text-base">{movies[0].overview}</p>
                <div className="flex gap-4 items-center pointer-events-auto">
                   <button 
                     onClick={() => setSelectedMovie({...movies[0], media_type: mediaType})}
                     className="bg-orange-500 hover:bg-orange-600 text-white px-6 md:px-8 py-3 rounded-full font-bold uppercase tracking-wide flex items-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                   >
                     <Play size={20} fill="currentColor" /> Details
                   </button>
                   <span className="text-white/70 text-sm font-medium hidden md:inline-block tabular-nums">
                     Rating {movies[0].vote_average?.toFixed(1)} / 10
                   </span>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
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
            <button 
              onClick={handleSurpriseMe}
              disabled={isSurprising}
              className="mt-8 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-3 transition backdrop-blur-md border border-white/20 hover:border-orange-500 hover:text-orange-400 group"
            >
              <Package size={18} className={isSurprising ? 'animate-spin' : 'group-hover:animate-spin'} />
              {isSurprising ? 'Finding Magic...' : 'Surprise Me'}
            </button>
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

        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             activeTab === 'discover' ? `${genres.find(g => g.id.toString() === selectedGenre)?.name || ''} ${mediaType === 'movie' ? 'Movies' : 'TV Series'}` :
             tabs.find(t => t.id === activeTab)?.label || 'Movies'}
          </h2>
          {!loading && movies.length > 0 && (
            <p className="text-xs text-white/45 tabular-nums">
              Showing {movies.length.toLocaleString()} {totalResults > movies.length ? `of ${totalResults.toLocaleString()}` : ''} titles
            </p>
          )}
        </div>
        
        {movies.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <p className="text-xl">No titles found.</p>
            <p className="text-sm mt-2">Try a different selection.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {loading 
                ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />) 
                : movies.map((m, i) => (
                    <MovieCard
                      key={`${m.id}-${i}`}
                      movie={{ ...m, media_type: mediaType }}
                      onClick={() => setSelectedMovie({ ...m, media_type: mediaType })}
                    />
                  ))
              }
            </div>

            {/* Load More Button */}
            {!loading && nextPage && (
              <div className="mt-14 flex flex-col items-center gap-3">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-h-[48px] px-10 py-3.5 rounded-full bg-white/[0.06] hover:bg-orange-500 text-white font-semibold tracking-wide text-sm border border-white/15 hover:border-orange-500 transition-all duration-200 flex items-center gap-3 disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Loading more {mediaType === 'movie' ? 'movies' : 'series'}...
                    </>
                  ) : (
                    <>Load More {mediaType === 'movie' ? 'Movies' : 'TV Series'}</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedMovie && (
        <MovieModal movieData={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
};

export default Home;