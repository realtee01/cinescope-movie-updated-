import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Heart,
  Search,
  LogIn,
  UserPlus,
  LogOut,
  Film,
  Tv,
  ChevronRight,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { watchlist, user, logoutDemo } = useMovieContext();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Lock background scroll and listen for Escape while the mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Automatically close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logoutDemo();
    setIsOpen(false);
    navigate('/');
  };

  const searchParams = new URLSearchParams(location.search);
  const isTvActive = location.pathname === '/' && searchParams.get('type') === 'tv';
  const isMoviesActive = location.pathname === '/' && !isTvActive;
  const isWatchlistActive = location.pathname === '/watchlist';

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] bg-[#0a0a0a] border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex flex-col items-end text-orange-500 transition-opacity hover:opacity-80 shrink-0"
            onClick={closeMenu}
          >
            <span className="text-2xl md:text-3xl font-playfair font-black tracking-tighter lowercase leading-none">
              cinescope
            </span>
            <span className="text-[7px] md:text-[8px] font-sans font-bold tracking-widest uppercase leading-none mr-1">
              movies
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          </form>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 font-medium">
            <Link to="/" className="hover:text-orange-500 transition whitespace-nowrap shrink-0">
              Movies
            </Link>

            <Link
              to="/watchlist"
              className="relative hover:text-orange-500 transition flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Watchlist
              <div className="relative ml-1">
                <Heart size={22} />
                {watchlist?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black tabular-nums">
                    {watchlist.length}
                  </span>
                )}
              </div>
            </Link>

            {user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold text-xs flex items-center justify-center">
                    {user.initials}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-white max-w-[120px] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-white/40">Demo Account</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-orange-400 transition border border-white/10"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-orange-500 transition border-l border-white/10 pl-8 whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-500 px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 whitespace-nowrap shrink-0"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              to="/watchlist"
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-white/90 hover:text-orange-500 transition-colors"
              onClick={closeMenu}
              aria-label="Watchlist"
            >
              <Heart size={24} />
              {watchlist?.length > 0 && (
                <span className="absolute top-1.5 right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#0a0a0a] tabular-nums">
                  {watchlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMenu}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#16161a] border border-white/10 text-white hover:border-orange-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay & Solid Editorial Drawer (Mounted outside <nav> to avoid fixed-position clipping) */}
      <div
        className={`fixed inset-0 z-[120] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Solid Darkened Scrim */}
        <div
          onClick={closeMenu}
          className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        />

        {/* Opaque Luxury Obsidian Sidebar Drawer */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className={`absolute top-0 right-0 h-[100dvh] w-[86%] max-w-[360px] bg-[#101013] border-l border-white/10 shadow-[-24px_0_64px_rgba(0,0,0,0.95)] flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Top Section: Header + Search + Primary Links */}
          <div className="flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#141418]">
              <Link to="/" onClick={closeMenu} className="flex flex-col items-end text-orange-500">
                <span className="text-2xl font-playfair font-black tracking-tighter lowercase leading-none">
                  cinescope
                </span>
                <span className="text-[7px] font-sans font-bold tracking-widest uppercase leading-none mr-1 text-white/60">
                  movies
                </span>
              </Link>

              <button
                onClick={closeMenu}
                aria-label="Close menu"
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[#1c1c22] border border-white/10 text-white/80 hover:text-white hover:border-orange-500/50 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Search Inside Drawer */}
            <div className="px-6 pt-5 pb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search titles, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 bg-[#18181d] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </form>
            </div>

            {/* Navigation List */}
            <div className="px-4 py-2">
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35">
                Discover
              </p>

              <nav className="flex flex-col gap-1">
                <Link
                  to="/?type=movie"
                  onClick={closeMenu}
                  className={`group flex items-center justify-between px-3 py-3.5 min-h-[56px] rounded-xl transition-colors ${
                    isMoviesActive
                      ? 'bg-[#1b1b21] text-white'
                      : 'text-white/80 hover:bg-[#17171c] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isMoviesActive
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#1c1c22] text-white/70 group-hover:text-orange-400'
                      }`}
                    >
                      <Film size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] leading-tight">Movies</p>
                      <p className="text-xs text-white/45 mt-0.5 truncate">
                        Trending, top rated & genres
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isMoviesActive ? 'text-orange-500' : 'text-white/30'
                    }`}
                  />
                </Link>

                <Link
                  to="/?type=tv"
                  onClick={closeMenu}
                  className={`group flex items-center justify-between px-3 py-3.5 min-h-[56px] rounded-xl transition-colors ${
                    isTvActive
                      ? 'bg-[#1b1b21] text-white'
                      : 'text-white/80 hover:bg-[#17171c] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isTvActive
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#1c1c22] text-white/70 group-hover:text-orange-400'
                      }`}
                    >
                      <Tv size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] leading-tight">TV Series</p>
                      <p className="text-xs text-white/45 mt-0.5 truncate">
                        Popular shows & seasons
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isTvActive ? 'text-orange-500' : 'text-white/30'
                    }`}
                  />
                </Link>

                <Link
                  to="/watchlist"
                  onClick={closeMenu}
                  className={`group flex items-center justify-between px-3 py-3.5 min-h-[56px] rounded-xl transition-colors ${
                    isWatchlistActive
                      ? 'bg-[#1b1b21] text-white'
                      : 'text-white/80 hover:bg-[#17171c] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isWatchlistActive
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#1c1c22] text-white/70 group-hover:text-orange-400'
                      }`}
                    >
                      <Heart size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] leading-tight">My Watchlist</p>
                      <p className="text-xs text-white/45 mt-0.5 tabular-nums">
                        {watchlist?.length || 0} {watchlist?.length === 1 ? 'saved title' : 'saved titles'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isWatchlistActive ? 'text-orange-500' : 'text-white/30'
                    }`}
                  />
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Thumb-Zone Account Dock (Solid Elevated Panel) */}
          <div className="p-6 bg-[#141418] border-t border-white/[0.08]">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/45 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-[#1e1e25] hover:bg-[#26262f] border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors"
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-white/45 leading-relaxed mb-1">
                  Sign in to personalize your CineScope experience and keep your watchlist handy.
                </p>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                >
                  <UserPlus size={18} /> Create Account
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="w-full h-12 rounded-xl bg-[#1c1c22] hover:bg-[#24242c] border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn size={18} /> Sign In
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
