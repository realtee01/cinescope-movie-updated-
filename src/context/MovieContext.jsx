import { createContext, useContext, useState, useEffect } from 'react';

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinescope_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinescope_demo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cinescope_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cinescope_demo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cinescope_demo_user');
    }
  }, [user]);

  const addToWatchlist = (movie) => {
    if (!watchlist.find(m => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
    }
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter(m => m.id !== movieId));
  };

  const isWatchlisted = (movieId) => watchlist.some(m => m.id === movieId);

  const getInitials = (name) => {
    const parts = (name || 'Guest').trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  const loginDemo = ({ email }) => {
    const cleanEmail = email.trim().toLowerCase();
    let storedUsers = {};
    try {
      storedUsers = JSON.parse(localStorage.getItem('cinescope_demo_accounts') || '{}');
    } catch {
      storedUsers = {};
    }
    const existing = storedUsers[cleanEmail];
    const displayName = existing?.name || cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const nextUser = {
      name: displayName,
      email: cleanEmail,
      initials: getInitials(displayName),
      isDemo: true,
    };
    setUser(nextUser);
    return nextUser;
  };

  const signupDemo = ({ name, email }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    try {
      const storedUsers = JSON.parse(localStorage.getItem('cinescope_demo_accounts') || '{}');
      storedUsers[cleanEmail] = { name: cleanName, email: cleanEmail };
      localStorage.setItem('cinescope_demo_accounts', JSON.stringify(storedUsers));
    } catch {
      // ignore storage errors
    }
    const nextUser = {
      name: cleanName,
      email: cleanEmail,
      initials: getInitials(cleanName),
      isDemo: true,
    };
    setUser(nextUser);
    return nextUser;
  };

  const logoutDemo = () => {
    setUser(null);
  };

  return (
    <MovieContext.Provider value={{ 
      watchlist, 
      addToWatchlist, 
      removeFromWatchlist, 
      isWatchlisted,
      user,
      loginDemo,
      signupDemo,
      logoutDemo,
    }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
};
