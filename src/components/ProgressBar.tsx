import { useEffect, useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  target: number;
}

export default function ProgressBar({ current, target }: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const percentage = Math.min((current / target) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative bg-cyber-dark/80 backdrop-blur-sm border border-cyber-purple/30 rounded-lg p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/5 to-transparent rounded-lg" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-cyber-cyan/50 rounded-lg">
              <Target className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <h3 className="font-orbitron text-white text-lg">FUNDING GOAL</h3>
              <p className="text-gray-400 text-sm font-cyber">赛博乞讨目标</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-green" />
              <span className="text-cyber-green font-cyber text-sm">ONGOING</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${animatedProgress}%`,
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)'
              }}
            />
            
            <div 
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ 
                width: `${animatedProgress}%`,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 font-orbitron">
          <div className="text-left">
            <div className="text-gray-400 text-xs">RAISED</div>
            <div className="text-cyber-cyan text-xl font-bold">{current.toFixed(2)}</div>
            <div className="text-gray-500 text-xs">CNY</div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400 text-xs">PROGRESS</div>
            <div className="text-cyber-purple text-2xl font-bold">{animatedProgress.toFixed(1)}%</div>
          </div>
          
          <div className="text-right">
            <div className="text-gray-400 text-xs">GOAL</div>
            <div className="text-white text-xl font-bold">{target.toFixed(2)}</div>
            <div className="text-gray-500 text-xs">CNY</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs font-cyber">
            <span className="text-gray-500">REMAINING:</span>
            <span className="text-cyber-orange">{Math.max(target - current, 0).toFixed(2)} CNY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
