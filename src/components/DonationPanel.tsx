import { useState } from 'react';
import { CreditCard, Sparkles } from 'lucide-react';

interface DonationPanelProps {
  onDonate: (amount: number) => void;
  isLoading: boolean;
}

const presetAmounts = [0.01, 0.1, 1, 10];

export default function DonationPanel({ onDonate, isLoading }: DonationPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    const numValue = parseFloat(value) || 0;
    setSelectedAmount(numValue);
  };

  const handleDonate = () => {
    const amount = isCustom ? (parseFloat(customAmount) || 0) : selectedAmount;
    if (amount > 0) {
      onDonate(amount);
    }
  };

  return (
    <div className="relative bg-cyber-dark/80 backdrop-blur-sm border border-cyber-cyan/30 rounded-lg p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 to-transparent rounded-lg" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 border border-cyber-purple/50 rounded-lg">
            <Sparkles className="w-5 h-5 text-cyber-purple" />
          </div>
          <h2 className="text-xl font-orbitron text-white">SELECT DONATION</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              className={`relative p-4 rounded-lg font-cyber text-lg transition-all duration-300 ${
                selectedAmount === amount && !isCustom
                  ? 'bg-cyber-cyan/20 border-2 border-cyber-cyan text-cyber-cyan'
                  : 'bg-transparent border-2 border-gray-700 text-gray-300 hover:border-cyber-cyan/50 hover:text-cyber-cyan'
              }`}
            >
              <span className="text-sm">CNY</span>
              <div className="text-xl font-bold">{amount.toFixed(2)}</div>
              {selectedAmount === amount && !isCustom && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyber-cyan rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 font-cyber mb-2">
            CUSTOM AMOUNT
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-cyan font-cyber text-lg">
              CNY
            </span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="输入自定义金额"
              className="w-full bg-transparent border-2 border-gray-700 rounded-lg px-10 py-3 text-white font-cyber text-lg focus:border-cyber-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-gray-400 font-cyber text-sm">SELECTED:</span>
          <span className="text-cyber-cyan font-orbitron text-2xl ml-2">
            {isCustom ? customAmount || '0.00' : selectedAmount.toFixed(2)} CNY
          </span>
        </div>

        <button
          onClick={handleDonate}
          disabled={isLoading || (isCustom && (!customAmount || parseFloat(customAmount) <= 0))}
          className="cyber-btn w-full py-4 bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 border-2 border-cyber-cyan text-cyber-cyan font-orbitron text-lg tracking-wider hover:from-cyber-cyan/30 hover:to-cyber-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
              PROCESSING...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              WECHAT PAY
            </>
          )}
        </button>

        <p className="text-center text-gray-500 text-xs mt-4 font-cyber">
          安全支付 · 微信官方渠道 · 即时到账
        </p>
      </div>
    </div>
  );
}
