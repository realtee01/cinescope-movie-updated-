import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Search, LogIn, UserPlus } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { watchlist } = useMovieContext(); // Matches your context export exactly
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-[#0a0a0a] border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo - Matching the requested layout */}
        <Link 
          to="/" 
          className="flex flex-col items-end text-orange-500 transition-opacity hover:opacity-80"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-2xl md:text-3xl font-playfair font-black tracking-tighter lowercase leading-none">cinescope</span>
          <span className="text-[7px] md:text-[8px] font-sans font-bold tracking-widest uppercase leading-none mr-1">movies</span>
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

        {/* Desktop Navigation (Visible on Laptops) */}
        <div className="hidden lg:flex items-center gap-8 font-medium">
          <Link to="/" className="hover:text-orange-500 transition">Movies</Link>
          
          <Link to="/watchlist" className="relative hover:text-orange-500 transition flex items-center gap-1">
            Watchlist
            <div className="relative ml-1">
              <Heart size={22} />
              {watchlist?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                  {watchlist.length}
                </span>
              )}
            </div>
          </Link>

          <Link to="/login" className="hover:text-orange-500 transition border-l border-white/10 pl-8">Login</Link>
          <Link to="/signup" className="bg-orange-500 px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
            Sign Up
          </Link>
        </div>

        {/* Mobile Icons Group (Visible on Phones) */}
        <div className="flex lg:hidden items-center gap-5">
           {/* Mobile Watchlist Heart with Counter */}
           <Link to="/watchlist" className="relative p-1" onClick={() => setIsOpen(false)}>
             <Heart size={26} />
             {watchlist?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                  {watchlist.length}
                </span>
             )}
           </Link>
           
           {/* Hamburger Toggle */}
           <button onClick={toggleMenu} className="text-white p-1 focus:outline-none">
             {isOpen ? <X size={30} /> : <Menu size={30} />}
           </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu Overlay (Fixed Transparency) */}
      <div className={`fixed inset-0 top-[60px] bg-[#0a0a0a] z-[99] flex flex-col transition-all duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex flex-col p-8 gap-8 text-2xl font-bold tracking-tight">
          <Link to="/" onClick={toggleMenu} className="border-b border-white/5 pb-4">
            Movies
          </Link>
          <Link to="/watchlist" onClick={toggleMenu} className="border-b border-white/5 pb-4 flex justify-between items-center">
            My Watchlist
            <span className="bg-orange-500 text-sm px-4 py-1 rounded-full">{watchlist?.length || 0}</span>
          </Link>
          <Link to="/login" onClick={toggleMenu} className="border-b border-white/5 pb-4 flex items-center gap-3">
            <LogIn size={24} /> Login
          </Link>
          <Link to="/signup" onClick={toggleMenu} className="bg-orange-500 p-5 rounded-2xl flex items-center justify-center gap-3 text-white">
            <UserPlus size={24} /> Create Account
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
