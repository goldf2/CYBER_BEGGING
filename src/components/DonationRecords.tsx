import { useEffect, useState, useRef } from 'react';
import { Clock, User } from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  donor_name: string;
  created_at: string;
}

interface DonationRecordsProps {
  donations: Donation[];
}

export default function DonationRecords({ donations }: DonationRecordsProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (donations.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [donations.length]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative bg-cyber-dark/80 backdrop-blur-sm border border-cyber-green/30 rounded-lg p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/5 to-transparent rounded-lg" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-cyber-green/50 rounded-lg">
              <Clock className="w-5 h-5 text-cyber-green" />
            </div>
            <div>
              <h3 className="font-orbitron text-white text-lg">RECENT DONATIONS</h3>
              <p className="text-gray-400 text-sm font-cyber">最新捐赠记录</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span className="text-cyber-green/70 font-cyber text-xs">LIVE</span>
          </div>
        </div>

        <div 
          ref={listRef}
          className={`space-y-3 max-h-64 overflow-y-auto transition-all duration-500 ${
            isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 font-cyber text-sm">NO DONATIONS YET</div>
              <div className="text-gray-700 font-cyber text-xs mt-2">成为第一个捐赠者!</div>
            </div>
          ) : (
            donations.map((donation, index) => (
              <div 
                key={donation.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyber-green/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-white font-cyber">{donation.donor_name}</div>
                    <div className="text-gray-500 text-xs font-cyber">{formatTime(donation.created_at)}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-cyber-green font-orbitron text-lg">+{donation.amount.toFixed(2)}</div>
                  <div className="text-gray-500 text-xs">CNY</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs font-cyber">
            <span className="text-gray-500">TOTAL DONORS:</span>
            <span className="text-cyber-cyan">{donations.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
