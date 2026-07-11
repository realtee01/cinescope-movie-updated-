import { useEffect } from 'react';

const Splash = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="flex flex-col items-end text-orange-500 animate-pulse">
          <span className="text-6xl md:text-8xl font-playfair font-black tracking-tighter lowercase leading-none">cinescope</span>
          <span className="text-sm md:text-lg font-sans font-bold tracking-widest uppercase leading-none mr-2 md:mr-4 mt-1">movies</span>
        </div>
        <div className="mt-8 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 animate-loading-bar origin-left"></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
