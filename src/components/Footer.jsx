import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-[#121212] border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-2 text-center text-white/50 text-sm">
        <p>
          &copy; {new Date().getFullYear()} cinescope. All rights reserved. Data provided by TMDB.
        </p>
        <p>
          built by <span className="text-white font-medium">Buildwithtobi</span>
        </p>
        <a 
          href="https://www.buildwithtobi.online" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-orange-500 hover:text-orange-400 transition-colors"
        >
          www.buildwithtobi.online
        </a>
      </div>
    </footer>
  );
};

export default Footer;
