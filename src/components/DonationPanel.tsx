import { useState } from 'react';
import { CreditCard, Sparkles, Globe } from 'lucide-react';

export type PaymentMethod = 'wechat' | 'creem';

interface DonationPanelProps {
  onDonate: (amount: number, method: PaymentMethod) => void;
  isLoading: boolean;
}

const CNY_PRESETS = [0.01, 0.1, 1, 10];
const USD_PRESETS = [1, 2, 5, 10];

export default function DonationPanel({ onDonate, isLoading }: DonationPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');

  const presets = paymentMethod === 'wechat' ? CNY_PRESETS : USD_PRESETS;
  const currency = paymentMethod === 'wechat' ? 'CNY' : 'USD';

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleDonate = () => {
    if (selectedAmount > 0) {
      onDonate(selectedAmount, paymentMethod);
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
          {presets.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              className={`relative p-4 rounded-lg font-cyber text-lg transition-all duration-300 ${
                selectedAmount === amount
                  ? paymentMethod === 'wechat'
                    ? 'bg-cyber-green/20 border-2 border-cyber-green text-cyber-green'
                    : 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                  : 'bg-transparent border-2 border-gray-700 text-gray-300 hover:border-cyber-cyan/50 hover:text-cyber-cyan'
              }`}
            >
              <span className="text-sm">{currency}</span>
              <div className="text-xl font-bold">
                {paymentMethod === 'wechat' ? amount.toFixed(2) : amount}
              </div>
              {selectedAmount === amount && (
                <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${
                  paymentMethod === 'wechat' ? 'bg-cyber-green' : 'bg-purple-500'
                }`} />
              )}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 font-cyber mb-2">
            PAYMENT METHOD
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setPaymentMethod('wechat');
                setSelectedAmount(1);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg font-cyber transition-all duration-300 ${
                paymentMethod === 'wechat'
                  ? 'bg-cyber-green/20 border-2 border-cyber-green text-cyber-green'
                  : 'bg-transparent border-2 border-gray-700 text-gray-300 hover:border-cyber-green/50 hover:text-cyber-green'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              WECHAT PAY
            </button>
            <button
              onClick={() => {
                setPaymentMethod('creem');
                setSelectedAmount(1);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg font-cyber transition-all duration-300 ${
                paymentMethod === 'creem'
                  ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                  : 'bg-transparent border-2 border-gray-700 text-gray-300 hover:border-purple-500/50 hover:text-purple-400'
              }`}
            >
              <Globe className="w-5 h-5" />
              CREEM PAY
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-gray-400 font-cyber text-sm">SELECTED:</span>
          <span className={`font-orbitron text-2xl ml-2 ${
            paymentMethod === 'wechat' ? 'text-cyber-green' : 'text-purple-400'
          }`}>
            {paymentMethod === 'wechat' ? selectedAmount.toFixed(2) : selectedAmount} {currency}
          </span>
        </div>

        <button
          onClick={handleDonate}
          disabled={isLoading || selectedAmount <= 0}
          className={`w-full py-4 border-2 font-orbitron text-lg tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
            paymentMethod === 'wechat'
              ? 'bg-gradient-to-r from-cyber-green/20 to-cyber-cyan/20 border-cyber-green text-cyber-green hover:from-cyber-green/30 hover:to-cyber-cyan/30'
              : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500 text-purple-400 hover:from-purple-500/30 hover:to-purple-600/30'
          }`}
          style={{ boxShadow: paymentMethod === 'wechat' ? '0 0 30px rgba(0, 255, 136, 0.2)' : '0 0 30px rgba(168, 85, 247, 0.2)' }}
        >
          {isLoading ? (
            <>
              <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
                paymentMethod === 'wechat' ? 'border-cyber-green' : 'border-purple-500'
              }`} />
              PROCESSING...
            </>
          ) : paymentMethod === 'wechat' ? (
            <>
              <CreditCard className="w-5 h-5" />
              WECHAT PAY
            </>
          ) : (
            <>
              <Globe className="w-5 h-5" />
              CREEM PAY
            </>
          )}
        </button>

        <p className="text-center text-gray-500 text-xs mt-4 font-cyber">
          {paymentMethod === 'wechat' ? '安全支付 · 微信官方渠道 · 即时到账' : '全球支付 · 支持美元 USD'}
        </p>
      </div>
    </div>
  );
}
