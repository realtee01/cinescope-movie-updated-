import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/person/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success === false) throw new Error("Not found");
        setPerson(data);
        const combined = [
          ...(data.movie_credits?.cast || []).map(c => ({...c, media_type: 'movie'})),
          ...(data.tv_credits?.cast || []).map(c => ({...c, media_type: 'tv'}))
        ].sort((a, b) => b.popularity - a.popularity);
        
        // Remove duplicates
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setCredits(unique);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
      
    window.scrollTo(0,0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-orange-500 transition-all inline-block"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="grid md:grid-cols-[300px_1fr] gap-12 mb-20">
          <div>
            <div className="rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10 mb-6 bg-white/5 aspect-[2/3]">
              {person.profile_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${person.profile_path}`} 
                  alt={person.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={64} className="text-white/20" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-xl mb-4 border-b border-white/10 pb-2">Personal Info</h3>
            <div className="space-y-4 text-sm text-white/70">
              <p><strong className="text-white/90">Known For:</strong> {person.known_for_department}</p>
              <p><strong className="text-white/90">Born:</strong> {person.birthday} {person.place_of_birth ? `(${person.place_of_birth})` : ''}</p>
            </div>
          </div>
          
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-6">{person.name}</h1>
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">Biography</h3>
              <p className="text-white/70 leading-relaxed font-light whitespace-pre-line text-lg">
                {person.biography || "We don't have a biography for this person."}
              </p>
            </div>
          </div>
        </div>
        
        {credits.length > 0 && (
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-orange-500"></span>
              Known For
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {credits.slice(0, 20).map(item => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;
