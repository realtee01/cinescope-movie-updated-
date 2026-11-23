import { GlassReveal21st } from '@/components/ui/liquid-glass-logo-reveal';

const Splash = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="relative flex flex-col items-center w-full max-w-md">
        {/* Liquid Glass Logo Reveal */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 relative flex items-center justify-center">
          <GlassReveal21st
            look="dark"
            background="#0a0a0a"
            plateColor="#121216"
            logoColor="#f97316"
            tileSize={196}
            logoScale={0.58}
            finalScale={0.85}
            loop={false}
            speed={1.1}
            label="CineScope Liquid Glass Reveal"
            className="w-full h-full"
          />
        </div>

        {/* CineScope Movies Brand Loader */}
        <div className="relative z-10 -mt-4 flex flex-col items-center">
          <div className="flex flex-col items-end text-orange-500 animate-pulse">
            <span className="text-5xl md:text-7xl font-playfair font-black tracking-tighter lowercase leading-none">
              cinescope
            </span>
            <span className="text-xs md:text-base font-sans font-bold tracking-widest uppercase leading-none mr-1 md:mr-3 mt-1">
              movies
            </span>
          </div>
          <div className="mt-6 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 animate-loading-bar origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
