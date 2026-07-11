const SkeletonCard = () => {
  return (
    <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 animate-pulse">
      {/* Aspect Ratio Box for the Image area */}
      <div className="aspect-[2/3] bg-zinc-800 w-full"></div>
      
      {/* Content Area */}
      <div className="p-4 space-y-3">
        {/* Title Bar */}
        <div className="h-4 bg-zinc-800 rounded-md w-3/4"></div>
        
        {/* Metadata Bars (Year/Rating) */}
        <div className="flex justify-between items-center">
          <div className="h-3 bg-zinc-800 rounded-md w-1/4"></div>
          <div className="h-3 bg-zinc-800 rounded-md w-1/5"></div>
        </div>
      </div>

      {/* Overlay Shine Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
};

export default SkeletonCard;
