import { useEffect, useState } from 'react';

interface CyberHeroProps {
  onDonateClick: () => void;
}

export default function CyberHero({ onDonateClick }: CyberHeroProps) {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-black/50 via-transparent to-cyber-black/80" />
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-purple to-transparent opacity-50" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="scan-line absolute w-full h-32 animate-scan opacity-30" />

      <div className="absolute top-20 left-10 text-cyber-cyan/30 text-xs font-orbitron tracking-widest">
        SYSTEM ONLINE
      </div>
      <div className="absolute top-20 right-10 text-cyber-purple/30 text-xs font-orbitron tracking-widest">
        CYBER BEGGING v1.0
      </div>
      <div className="absolute bottom-20 left-10 text-cyber-green/30 text-xs font-orbitron tracking-widest">
        [STATUS: ACTIVE]
      </div>
      <div className="absolute bottom-20 right-10 text-cyber-orange/30 text-xs font-orbitron tracking-widest">
        DONATIONS: 0000
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 border border-cyber-cyan/50 text-cyber-cyan text-sm font-orbitron tracking-wider mb-4">
            // CYBER BEGGING INITIATED
          </span>
        </div>

        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-6 ${glitchActive ? 'glitch-text' : ''}`}>
          <span className="text-white">CYBER</span>
          <span className="text-cyber-cyan neon-text ml-2">BEGGING</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 font-cyber mb-4 leading-relaxed">
          欢迎来到赛博乞讨网络空间
        </p>
        
        <p className="text-lg text-gray-400 font-cyber mb-8 max-w-2xl mx-auto">
          在这个数字时代，每一份微小的捐赠都是对未来的投资。
          你的慷慨将帮助我们继续探索赛博空间的边界。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onDonateClick}
            className="cyber-btn px-8 py-4 bg-transparent border-2 border-cyber-cyan text-cyber-cyan font-orbitron text-lg tracking-wider hover:bg-cyber-cyan/20 transition-all duration-300"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
          >
            DONATE NOW
          </button>
          
          <div className="flex items-center gap-2 text-cyber-purple/70">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span className="font-cyber text-sm">LIVE DONATIONS</span>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-8 text-xs font-orbitron text-gray-500">
          <div className="text-center">
            <div className="text-cyber-cyan text-2xl mb-1">24/7</div>
            <div>ONLINE</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-purple text-2xl mb-1">100%</div>
            <div>SECURE</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-2xl mb-1">INSTANT</div>
            <div>TRANSFER</div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-cyber-cyan/30 to-transparent" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-cyber-purple/30 to-transparent" />
    </section>
  );
}
