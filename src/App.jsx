/**
 * CineScope - Movie Discovery Web App
 * Built by: Tobiloba Akala
 * Features: Context API, TMDB Integration, Persistent Watchlist
 */
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Watchlist from './pages/Watchlist';
import PersonDetail from './pages/PersonDetail';
import Splash from './components/Splash';

function App() {
  const [loading, setLoading] = useState(true);
  
  // Splash Screen timer (4.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MovieProvider>
      {loading ? (
        <Splash />
      ) : (
        <Router>
          <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500 selection:text-white flex flex-col">
            <Navbar />
            
            {/* pt-20 ensures the Navbar doesn't cover your Home content */}
            <main className="pt-20 flex-grow"> 
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:mediaType/:id" element={<MovieDetail />} />
                <Route path="/person/:id" element={<PersonDetail />} />
                <Route path="/watchlist" element={<Watchlist />} />
                
                {/* Optional: Future-proofing for your Login/Signup */}
                <Route path="/login" element={
                  <div className="h-[60vh] flex items-center justify-center italic text-gray-500">
                    Login functionality coming soon...
                  </div>
                } />
                <Route path="/signup" element={
                  <div className="h-[60vh] flex items-center justify-center italic text-gray-500">
                    Signup functionality coming soon...
                  </div>
                } />
              </Routes>
            </main>
            
            <Footer />
            <BackToTop />
          </div>
        </Router>
      )}
    </MovieProvider>
  );
}

export default App;
